# %%
import numpy as np
import pandas as pd
import geopandas as gpd
import folium
import matplotlib.pyplot as plt
from scipy.stats import linregress

# %%
# IMPORTING THE DATA CSV INTO A GEOPANDAS DATAFRAME
world_filepath = gpd.datasets.get_path('naturalearth_lowres')
world = gpd.read_file(world_filepath)

# %%
world.explore()

# %%
