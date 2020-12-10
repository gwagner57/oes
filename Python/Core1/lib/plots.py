import matplotlib.pyplot as plt
import sys
import numpy as np
import scipy.special as sps
if not sys.warnoptions:
    import warnings
    warnings.simplefilter( "ignore" )

import seaborn as sns
# settings for seaborn plotting style
sns.set( color_codes = True )
# settings for seaborn plot sizes
sns.set( rc = {'figure.figsize':(5,5)} )

def plot_exponential( name, data ):
	count, bins, ignored = plt.hist(data, 15, density = True)
	plt.plot( linewidth = 2, color = 'r' )
	plt.title( "Exponential" ) 
	plt.show()

def plot_gamma ( name, data ,shape , scale ) :
	count, bins, ignored = plt.hist( data, 15, density = True ) 
	y = bins**( shape-1 )*( np.exp( -bins/scale ) /  ( sps.gamma( shape )*scale**shape ) )
	plt.plot( bins, y, linewidth = 2, color = 'r' )
	plt.title( "Gamma" )
	plt.show()

def plot_normal(name, data, mu, sigma ) :
	count, bins, ignored = plt.hist(data, 15, density = True)
	plt.plot( bins, 1/(sigma * np.sqrt(2 * np.pi)) * np.exp( - (bins - mu)**2 / (2 * sigma**2) ), linewidth = 2, color = 'r' )
	plt.title ( "Normal" )
	plt.show()
def plot_triangle( name, data ) :
	h = plt.hist( data,  bins = 20, density = True , rwidth = 3, color ='skyblue' )
	plt.title( "Triangular" )
	plt.show()
def plot_uniform( name, data ) :
	count, bins, ignored = plt.hist( data, 15, density = True )
	plt.plot( bins, np.ones_like( bins ), linewidth = 2, color = 'r')
	plt.title( " Uniform" )
	plt.show()
def plot_uniformInt( name, data ) :
	count, bins, ignored = plt.hist( data, 15, density = True )
	plt.plot( bins, np.ones_like( bins ), linewidth = 2, color = 'r')
	plt.title ( "UniformInt" )
	plt.show()
def plot_pareto( name , data , a , m ) :
	count, bins, _ = plt.hist( data, 15, density = True )
	fit = a*m**a / bins**(a+1)
	plt.plot( bins, max( count )*fit/max( fit ), linewidth = 2, color = 'r' )
	plt.title ( "Pareto" )
	plt.show()
def plot_weibull( name , data  ) :
	count, bins, _= plt.hist( data, 15, density = True )
	plt.show()
def plot_pert( name, data ):
	sns.kdeplot(data.rvs(10000))
	plt.title("Pert")
	plt.show()

def plot_frequency( name, data ):
	count, bins, ignored = plt.hist(data, 15, linewidth = 1, density = True) 
	plt.title ( "Frequency" )
	plt.show()

