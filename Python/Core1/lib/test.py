#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
from oes_distributions import *
#importlib.import_module("rand")
from plots import make_plot

seed = Rand( random.randint( 1,1000 ) )

#print(seed.seed)

exponential_value = seed.exponential( 0.5 )
make_plot( "Exponential", exponential_value )


gamma_value = seed.gamma( 1.0, 2.0 )
make_plot( "Gamma", gamma_value )


normal_value = seed.normal( 1.5, 0.5 )
make_plot( "Normal", normal_value )

uniform_value = seed.uniform( 0.5, 1.5 )
make_plot( "Uniform", uniform_value )

uniformInt_value = seed.uniformInt( 1, 40 )
make_plot( "UniformInt", uniformInt_value )

triangular_value = seed.triangular( 0.5, 1.5, 1.0 )
make_plot( "Triangular", triangular_value )

pareto_value = seed.pareto( 2.0 )
make_plot( "Pareto", pareto_value )


weibull_value = seed.weibull( 1, 0.5 )
make_plot( "Weibull", weibull_value )

frequency_value = seed.frequency( { "20":1.4, "30":2.6 , "60":3.8, "80":1.9 } )
make_plot( "Frequency", frequency_value )

pert_value = seed.pertdist( 10, 190, 200 )
make_plot( "PertDistributiion", pert_value )