
# still working need to implement UniformInt and frequency

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
from scipy import stats
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

   def exponential( self, event_rate):
      return  self.rng.exponential( scale = 1 / event_rate)

   def gamma( self, alpha, beta):
    return self.rng.gamma ( shape = alpha , scale = beta  )

   def normal( self, mean, stdDev):
     return self.rng.normal( loc = mean , scale = stdDev )

   def uniform( self, lowerBound , upperBound ):
     return self.rng.uniform( low = lowerBound , high = upperBound  )

   def uniformInt( self, lowerBound, upperBound ) :
      return self.rng.integers( high = upperBound , low = lowerBound )

   def triangular( self, lowerBound, upperBound, mode  ):
      return self.rng.triangular( left = lowerBound, mode = mode, right = upperBound  )

   def pareto( self, shape ):
      return self.rng.pareto( a = shape )

   def weibull( self, shape  ):
      return self.rng.weibull( a = shape )
   
   def frequency( self, frequencyMap ):
      arrayOfkeys = []
      weights = []
      for key in frequencyMap:
         arrayOfkeys.append( int( key) )
         weights.append( frequencyMap[key] )
      cumcout, lowerlimit, binsize, extrapoints = stats.cumfreq( arrayOfkeys, numbins = 10, weights = weights )
      return cumcout

   def pertdist( self, minimum, most_likely, maximum ):
      pert = PERT( minimum, most_likely, maximum )
      return pert

def printDistributions():
   print( "please, choose distribution:" )
   print( "-exponential (e): event_rate" )
   print( "-gamma (g): alpha, beta" )
   print( "-normal (n): mean, stdDev" )
   print( "-uniform (u): lowerBound , upperBound " )
   print( "-uniformInt (ui): lowerBound , upperBound " )
   print( "-triangular (t): lowerBound, upperBound, mode " )
   print( "-pareto(pa): shape " )
   print( "-weibull (w): shape" )
   print( "-frequency (f)" )
   print( "-pertdist (pe): minimum, most_likely, maximum\n" )

def checkCorrectness( name_list ):
   distribution_names = {"e": 1, "g": 2, "n": 2, "u": 2, "ui": 2, "t": 3, "pa": 1, "w": 1, "f": 4, "pe": 3}
   if len(name_list) == 1 and name_list[0] == "f":
      return True
   if len(name_list) <= 1:
      return False
   else:
      if name_list[0] not in distribution_names:
         return False
      else:
         if distribution_names[name_list[0]] != len(name_list) - 1:
            return False
   return True

def check_name_list( name_list ):
   c = 0
   for t in name_list:
      if(c == 0):
         c = 1
         continue
      try:
         tt = float(t)
      except:
         print( "please, enter a proper number" )
         return False
   return True

if __name__ == "__main__":
   seed = 1234567  # test seed
   rand = Rand( seed )
   while(True):
      printDistributions()
      distribution_name = input()
      distribution_name = distribution_name.strip()
      name_list = distribution_name.split( " " )
      try:
         if checkCorrectness( name_list ) and ( check_name_list( name_list ) ):
            if name_list[0] == "e":
               exponential_value = rand.exponential( float( name_list[1] ) )
               plots.plot_exponential( "Exponential", exponential_value )
            elif name_list[0] == "g":
               gamma_value = rand.gamma( float( name_list[1] ) , float( name_list[2] ))
               plots.plot_gamma( "Gamma", gamma_value , float( name_list[1] ) , float( name_list[2] ) )
            elif name_list[0] == "n":
               normal_value = rand.normal( float( name_list[1] ), float( name_list[2] ) )
               plots.plot_normal( "Normal" ,normal_value , float( name_list[1] ), float( name_list[2] ) )
            elif name_list[0] == "u":
               uniform_value = rand.uniform( float( name_list[1] ), float( name_list[2] ) )
               plots.plot_uniform( "Uniform", uniform_value )
            elif name_list[0] == "ui":
               uniformInt_value = rand.uniformInt( float( name_list[1] ), float( name_list[2] ) )
               plots.plot_uniformInt( "UniformInt", uniformInt_value )
            elif name_list[0] == "t":
               triangular_value = rand.triangular( float( name_list[1] ), float( name_list[2] ) ,float( name_list[3] ) ) 
               plots.plot_triangle( "Triangular", triangular_value ) 
            elif name_list[0] == "pa":
               pareto_value = rand.pareto( float(name_list[1] ) )
               plots.plot_pareto( "Pareto", pareto_value , float( name_list[1] ) )
            elif name_list[0] == "w":
               weibull_value = rand.weibull( float( name_list[1] ) )
               plots.plot_weibull( "Weibull" , weibull_value )
            elif name_list[0] == "f" :
               class_list = dict()

               while( True ):
                  data = input( 'Enter frequency & frequency value separated by ":" or stop by empty line:\n' ) 
                  if data == "":
                     break
                  temp = data.split( ':' ) 
                  class_list[ temp[0] ] = float( temp[1] ) 
                  # Displaying the dictionary 
                  for key, value in class_list.items(): 
                     print( 'Frequency: {}, Frequency value: {}'.format( key, value ) )
               frequency_value = rand.frequency( class_list )
               plots.plot_frequency( "frequency", frequency_value )
               
            elif name_list[0] == "pe" :
               pert_value = rand.pertdist( float( name_list[1] ) , float( name_list[2] ) , float( name_list[3] ) )
               #most likely should be 0
               plots.plot_pert( "Pert", pert_value )
         else:
            print( "please, input correct sequence\n" )
      except:
         print( "Please, correct your input\n" )


   
   
#   {"2":0.4, "3":0.6}
   