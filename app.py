from flask import Flask, request, jsonify, render_template
import psycopg2
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Permite llamadas desde el visor web



# === CONEXIÓN A POSTGRESQL ===
def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="taller3SIG3",
        user="postgres",
        password="P",
        port=5432
    )


# === RUTA 1: Agregar nuevo reporte ===
@app.route("/agregar_reporte", methods=["POST"])
def agregar_reporte():
    data = request.json
    tipo = data["tipo"]
    lat = data["lat"]
    lng = data["lng"]
    descripcion = data.get("descripcion", None)

    try:
        conn = get_connection()
        cur = conn.cursor()
        query_barrio = """
            SELECT id_barrio FROM barrios
            WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
            LIMIT 1
        """
        cur.execute(query_barrio, (lng, lat))
        result = cur.fetchone()

        if not result:
            cur.close()
            conn.close()
            return jsonify({"error": "No se encontró un barrio para esa ubicación."}), 400

        id_barrio = result[0]
        query_insert = """
            INSERT INTO reportes_ciclovia (tipo, geom, id_barrio, descripcion)
            VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s)
        """
        cur.execute(query_insert, (tipo, lng, lat, id_barrio, descripcion))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": "Reporte guardado correctamente"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTA 2: Cargar lista de barrios ===
@app.route("/barrios", methods=["GET"])
def cargar_barrios():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_barrio, barrio FROM barrios ORDER BY barrio")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([{"id": r[0], "nombre": r[1]} for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTA 3: Obtener los reportes como GeoJSON ===
@app.route("/reportes_geojson", methods=["GET"])
def reportes_geojson():
    try:
        conn = get_connection()
        cur = conn.cursor()
        query = """
            SELECT id, tipo, descripcion,
            ST_AsGeoJSON(geom)::json AS geometry
            FROM reportes_ciclovia
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        features = []
        for row in rows:
            id, tipo, descripcion, geometry = row
            feature = {
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "id": id,
                    "tipo": tipo,
                    "descripcion": descripcion
                }
            }
            features.append(feature)

        return jsonify({
            "type": "FeatureCollection",
            "features": features
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTA 4: Eliminar un reporte por su ID ===
@app.route("/eliminar_reporte/<int:id>", methods=["DELETE"])
def eliminar_reporte(id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM reportes_ciclovia WHERE id = %s", (id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": f"Reporte {id} eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTA 5: Actualizar un reporte por su ID ===
@app.route("/actualizar_reporte/<int:id>", methods=["PUT"])
def actualizar_reporte(id):
    try:
        data = request.json
        nuevo_tipo = data["tipo"]
        nueva_descripcion = data.get("descripcion", None)

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE reportes_ciclovia
            SET tipo = %s, descripcion = %s
            WHERE id = %s
        """, (nuevo_tipo, nueva_descripcion, id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensaje": f"Reporte {id} actualizado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# === RUTA PRINCIPAL PARA VISOR HTML ===
@app.route("/")
def index():
    return render_template("index.html")  # Asegúrate de tener /templates/index.html

# === INICIAR SERVIDOR ===
if __name__ == "__main__":
    app.run(debug=True)

