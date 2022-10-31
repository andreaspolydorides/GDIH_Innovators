from flask import Blueprint, render_template, request, jsonify, redirect, url_for

import numpy as np
import pandas as pd
import geopandas as gpd
import folium
import matplotlib.pyplot as plt
from scipy.stats import linregress

views = Blueprint(__name__, "views")

@views.route("/")
def home():
    return render_template("map.html")

@views.route("/")
def plot():
    world_filepath = gpd.datasets.get_path('naturalearth_lowres')
    world = gpd.read_file(world_filepath)
    world.explore()

@views.route("/profile")
def profile():
    return render_template("profile.html")

@views.route("/json")
def get_json():
    return jsonify({'name': 'tim', 'coolness': 10})

@views.route("/data")
def get_data():
    data = request.json
    return jsonify(data)

@views.route("go-to-home")
def go_to_home():
    return redirect(url_for("views.home"))