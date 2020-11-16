#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
import numpy as np
import math
from scipy.stats import expon
from scipy.stats import gamma
from scipy.stats import norm
from scipy.stats import uniform
from scipy.stats import triang
from scipy.stats import pareto
from scipy.stats import weibull_max
from scipy.stats import weibull_min
import matplotlib.pyplot as plt
import sys
if not sys.warnoptions:
    import warnings
    warnings.simplefilter("ignore")

import seaborn as sns
# settings for seaborn plotting style
sns.set(color_codes=True)
# settings for seaborn plot sizes
sns.set(rc={'figure.figsize':(5,5)})

class Rand:
   # LOG4 = math.log(4.0)
   # SG_MAGICCONST = 1.0 + math.log(4.5)
   def __init__(rand):
      rand.LOG4 = math.log(4.0)
      rand.SG_MAGICCONST = 1.0 + math.log(4.5)

   def print_all(rand):
      print("LOG4: ", rand.LOG4)
      print("SG_MAGICCONST: ", rand.SG_MAGICCONST)

   def exponential(self, lambda1):
   	data_expon = expon.rvs(scale=1/lambda1,loc=0,size=1000)

   	ax = sns.distplot(data_expon,
                     kde=True,
                     bins=100,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Exponential Distribution', ylabel='Frequency')
   	plt.show()


   def gamma1(self, shape, scale):
   	data_gamma = gamma.rvs(a=shape, scale=scale, size=10000)
   	ax = sns.distplot(data_gamma,
                     kde=True,
                     bins=100,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Gamma Distribution', ylabel='Frequency')
   	plt.show()

   def normal(self, mean, stdDev):
   	data_normal = norm.rvs(size=10000,loc=mean,scale=stdDev)
   	ax = sns.distplot(data_normal,
                     bins=100,
                     kde=True,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Normal Distribution', ylabel='Frequency')
   	plt.show()

   def uniform1(self, lowerBound, upperBound):
   	data_uniform = uniform.rvs(size=10000, loc = lowerBound, scale=upperBound)

   	ax = sns.distplot(data_uniform,
                     bins=100,
                     kde=True,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Uniform Distribution ', ylabel='Frequency')
   	plt.show()

   def triangular(self, lowerBound, upperBound, mode):
   	data_uniform = triang.rvs(size=10000, c=mode, loc = lowerBound, scale=upperBound)

   	ax = sns.distplot(data_uniform,
                     bins=100,
                     kde=True,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Triangular Distribution ', ylabel='Frequency')
   	plt.show()

   def pareto1(self, shape):
   	data_uniform = pareto.rvs(size=10000, b=shape)

   	ax = sns.distplot(data_uniform,
                     bins=100,
                     kde=True,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
   	ax.set(xlabel='Pareto Distribution ', ylabel='Frequency')
   	plt.show()
   def weibull1(self,shape,scale):

      data_weibull = weibull_max.rvs(c=shape, scale=scale, size=10000)
      ax = sns.distplot(data_weibull,
                     bins=100,
                     kde=True,
                     color='skyblue',
                     hist_kws={"linewidth": 15,'alpha':1})
      ax.set(xlabel='weibull_max ', ylabel='Frequency')
      plt.show()
rand = Rand()
rand.print_all()
rand.exponential(0.5)
rand.gamma1(1.0, 2.0)
rand.normal(1.5, 0.5)
rand.uniform1(0.5, 1.5)
rand.triangular(0.5, 1.5, 1.0)
rand.pareto1(2.0)
rand.weibull1(1,0.5)