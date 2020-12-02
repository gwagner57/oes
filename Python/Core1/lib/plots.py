import matplotlib.pyplot as plt
import sys
import numpy as np
if not sys.warnoptions:
    import warnings
    warnings.simplefilter( "ignore" )

import seaborn as sns
# settings for seaborn plotting style
sns.set( color_codes = True )
# settings for seaborn plot sizes
sns.set( rc = {'figure.figsize':(5,5)} )

def plot_normal(name, data, mu, sigma ):
	count, bins, ignored = plt.hist(data, 30, density=True)
	plt.plot( bins, 1/(sigma * np.sqrt(2 * np.pi)) * np.exp( - (bins - mu)**2 / (2 * sigma**2) ), linewidth=2, color='r' )
	plt.show()
def plot_triangle( name, data ):
	h = plt.hist( data, bins=200, density=True , rwidth = 3, color='r' )
	plt.show()
def plot_uniform( name, data ) :
	count, bins, ignored = plt.hist(data, 15, density=True)
	plt.plot(bins, np.ones_like(bins), linewidth=2, color='r')
	plt.show()
def plot_pareto( name , data , a , m ) :
	count, bins, _ = plt.hist( data, 100, density=True )
	fit = a*m**a / bins**(a+1)
	plt.plot( bins, max( count )*fit/max( fit ), linewidth=2, color='r' )
	plt.show()
def plot_weibull(name , data ,a, scale , weibull ):
	count, bins, ignored = plt.hist(data , 100 ,density = True)
	a = np.arange(1,100.)/50.
	scale = count.max()/weibull(a, 1., 5.).max()
	plt.plot(a, weibull(a, 1., 5.)*scale)
	plt.show()
# def make_plot( name, data ):
# 	count, bins, ignored = plt.hist(data, 30, density=True)
# 	plt.plot(bins, data, linewidth=2, color='r')
# 	plt.title(f"The function is {name}")
# 	plt.xlabel(name)
# 	plt.ylabel('Frequency')
# 	plt.show()
   # ax = sns.distplot( data,
   #    kde = True,
   #    bins = 100,
   #    color = 'skyblue',
   #    hist_kws = { "linewidth": 15, 'alpha':1}  )
   # ax.set( xlabel = name, ylabel = 'Frequency')
