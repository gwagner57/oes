
# still working need to implement Frequency , gamma , exponential  

"""
Create random number streams

from numpy.random import default_rng
seed1 = 1
gen1 = default_rng( seed1)
seed2 = 2
gen2 = default_rng( seed2)
rns1_1 = gen1.rand()
rns1_2 = gen1.rand()
rns2_1 = gen2.rand()
rns2_2 = gen2.rand()
"""

from numpy.random import default_rng
from pert import PERT
from scipy.stats import randint
import plots 
import matplotlib.pyplot as plt
import sys
if not sys.warnoptions:
    import warnings
    warnings.simplefilter( "ignore" )

import seaborn as sns
# settings for seaborn plotting style
sns.set( color_codes=True )
# settings for seaborn plot sizes
sns.set( rc = { 'figure.figsize':(5,5) } )

class Rand:
   def __init__( self, seed ):
      self.rng = default_rng( seed )  # RNG initialization


   def exponential(  self, event_rate ):
      return  self.rng.exponential( scale = 1 / event_rate )


   # def gamma( self, shape , scale,  ):
   #  return self.rng.gamma ( a = shape , scale =  )
      # if(self.seed is not None):
      #    data_gamma = gamma.rvs ( a = shape, scale = scale, size = 10000, random_state = self.seed )
      # else:
      #    data_gamma = gamma.rvs ( a = shape, scale = scale, size = 10000 )
      # return data_gamma

   def normal( self, mean, stdDev, size):
     return self.rng.normal( loc = mean , scale = stdDev , size = 10000 )
   #    # if(self.seed is not None):
   #    #    data_normal = norm.rvs ( size = 10000, loc = mean, scale = stdDev, random_state = self.seed )
   #    # else:
   #    #    data_normal = norm.rvs ( size = 10000, loc = mean, scale = stdDev )
   #    # return data_normal

   def uniform( self, lowerBound , upperBound , size):
     return self.rng.uniform( low = lowerBound , high = upperBound , size = 10000)
   #    # if(self.seed is not None):
   #    #    data_uniform = uniform.rvs ( size = 10000, loc = lowerBound, scale = upperBound, random_state = self.seed )
   #    # else: 
   #    #    data_uniform = uniform.rvs ( size = 10000, loc = lowerBound, scale = upperBound )
   #    # return data_uniform

   # def uniformInt( self, lowerBound, upperBound ) :
   #    return self.rng.randint( high = upperBound , low = lowerBound )
   # #    # if(self.seed is not None):
   # #    #    data_uniformInt = randint.rvs ( high = upperBound, low = lowerBound , loc = 0, size = 1000, random_state = self.seed )
   # #    # else:
   # #    #    data_uniformInt = randint.rvs ( high = upperBound, low = lowerBound , loc = 0, size = 1000)
   # #    # return data_uniformInt

   def triangular( self, lowerBound, upperBound, mode , size ):
      return self.rng.triangular( left = lowerBound, mode = mode, right = upperBound , size = 10000 )
   #  def triangular( self, lowerBound, upperBound, mode ):
   # #    # if(self.seed is not None):
   # #    #    data_triangular = triang.rvs ( size = 10000, c = mode, loc = lowerBound, scale = upperBound, random_state = self.seed )
   # #    # else:
   # #    #    data_triangular = triang.rvs ( size = 10000, c = mode, loc = lowerBound, scale = upperBound )
   # #    # return data_triangular

   def pareto( self, shape , size ):
      return self.rng.pareto( a = shape , size = 10000)
   # #    # if(self.seed is not None):
   # #    #    data_pareto  = pareto.rvs ( size = 10000, b = shape, random_state = self.seed )
   # #    # else:
   # #    #    data_pareto  = pareto.rvs ( size = 10000, b = shape )
   # #    # return data_pareto
   def weibull( self, shape , size ):
      return self.rng.weibull( a = shape , size = 10000 )

   # #    # if(self.seed is not None):
   # #    #    data_weibull = weibull_max.rvs( c = shape, scale = scale, size = 10000, random_state = self.seed  )
   # #    # else:
   # #    #    data_weibull = weibull_max.rvs( c = shape, scale = scale, size = 10000  )
   # #    # return data_weibull
   
   # def frequency( self, frequencyMap ):
   # #    arrayOfkeys = []
   #    weights = []
   #    for key in frequencyMap:
   #       arrayOfkeys.append( int(key) )
   #       weights.append( frequencyMap[key] )
   #    cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq( arrayOfkeys, numbins = 4, weights = weights )
   #    return cumcout

   #  def pertdist( self, minimum, most_likely, maximum ):
   # #    # pert = PERT( minimum, most_likely, maximum )
   # #    # if(self.seed is not None):
   # #    #    pert = sns.kdeplot( pert.rvs( 10000, random_state = self.seed ) )
   # #    # else:
   # #    #    pert = sns.kdeplot( pert.rvs( 10000) )


if __name__ == "__main__":
   seed = 1234567  # test seed
   rand = Rand( seed )
   # exponential_value = rand.exponential( 0.5 )
   # print(exponential_value)
   # gamma_value = rand.gamma( 1.0, 2.0  )
   normal_value = rand.normal( 1.5, 0.5 , 10000)
   print(normal_value)
   uniform_value = rand.uniform( 0.5, 1.5 , 10000 )
   # uniformInt_value = rand .uniformInt( 1, 40 )
   triangular_value = rand.triangular( 0.5, 1.5, 1.0 , 10000)
   pareto_value = rand.pareto( 2.0 , 10000)
   weibull_value = rand.weibull( 0.5 , 10000)
   print( weibull_value )
   # frequency_value = rnd.frequency( { "20":1.4, "30":2.6 , "60":3.8, "80":1.9 } )
   # pert_value = rnd.pertdist( 10, 190, 200 )
  

   # make_plot("Exponential", exponential_value)
   # make_plot( "Gamma", gamma_value )
   plots.plot_normal( "Normal", normal_value , 1.5, 0.5 )
   plots.plot_uniform( "Uniform", uniform_value )
   # make_plot( "UniformInt", uniformInt_value )
   plots.plot_triangle( "Triangular", triangular_value  )
   plots.plot_pareto( "Pareto", pareto_value , 2.0 ,0 )
   plots.plot_weibull( "Weibull", weibull_value )
   
   # make_plot( "Frequency", frequency_value )
   # make_plot( "PertDistributiion", pert_value )