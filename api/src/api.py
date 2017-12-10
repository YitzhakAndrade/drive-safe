# -*- coding: utf-8 -*-

#import logging
import os
import traceback
import pandas as pd
from flask import Flask, jsonify, Response, request, render_template
from flask_cors import CORS

import googlemaps
from datetime import datetime
    

# ===========================================================
#   Inicializacao de objetos
# ===========================================================

app = Flask(__name__,
            static_url_path='',
            static_folder='web/static',
            template_folder='web/templates')

CORS(app)

gmaps = googlemaps.Client(key='AIzaSyAR6i805b5TRZbDCdq2aCB0qimdH0aU2yc')

df_acidentes = pd.read_csv('../data/acidentes.csv', error_bad_lines=False, encoding='utf-8')


# ===========================================================
#   Error Handlers
# ===========================================================

@app.errorhandler(Exception)
def tratar_erro(error):
    trace = traceback.format_exc()
    #logging.error(trace)
    print(trace)
    return Response(None, '500 Erro interno do servidor')


# ===========================================================
#   Rotas
# ===========================================================

@app.route('/BuscarAcidentes', methods=['GET'])
def index():

    origem = request.args.get('origem')
    destino = request.args.get('destino')

    now = datetime.now()
    directions_result = gmaps.directions(origem, destino, mode="driving", departure_time=now)

    df_resultados = pd.DataFrame()

    for step in directions_result[0]['legs'][0]['steps']:
        start = step['start_location']
        end = step['end_location']

        lat_min = min([ start['lat'], end['lat'] ])
        lat_max = max([ start['lat'], end['lat'] ])        
        lng_min = min([ start['lng'], end['lng'] ])
        lng_max = max([ start['lng'], end['lng'] ])
    
        margem = 0.000001

        lat_min -= margem
        lat_max += margem
        lng_min -= margem
        lng_max += margem

        e = df_acidentes[
            (df_acidentes.lat >= lat_min) &
            (df_acidentes.lat <= lat_max) &
            (df_acidentes.log >= lng_min) &
            (df_acidentes.log <= lng_max)
        ]

        df_resultados = df_resultados.append(e)


    df_json = df_resultados[['lat', 'log']].drop_duplicates().to_json(orient='records')

    outjson = jsonify({
        'acidentes': df_json
    })

    return outjson