#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
from oes_distributions import *
#importlib.import_module("rand")
from plots import make_plot

def test(seed):
	# seed = random.randint( 1,1000 )
	rnd = Rand( seed )

	exponential_value = rnd.exponential( 0.5 )
	make_plot( "Exponential", exponential_value )

	gamma_value = rnd.gamma( 1.0, 2.0 )
	make_plot( "Gamma", gamma_value )

	normal_value = rnd.normal( 1.5, 0.5 )
	make_plot( "Normal", normal_value )

	uniform_value = rnd.uniform( 0.5, 1.5 )
	make_plot( "Uniform", uniform_value )

	uniformInt_value = rnd.uniformInt( 1, 40 )
	make_plot( "UniformInt", uniformInt_value )

	triangular_value = rnd.triangular( 0.5, 1.5, 1.0 )
	make_plot( "Triangular", triangular_value )

	pareto_value = rnd.pareto( 2.0 )
	make_plot( "Pareto", pareto_value )

	weibull_value = rnd.weibull( 1, 0.5 )
	make_plot( "Weibull", weibull_value )

	frequency_value = rnd.frequency( { "20":1.4, "30":2.6 , "60":3.8, "80":1.9 } )
	make_plot( "Frequency", frequency_value )

	pert_value = rnd.pertdist( 10, 190, 200 )
	make_plot( "PertDistributiion", pert_value )


if __name__ == "__main__":
    import sys
    seed = None
    if(len(sys.argv) == 2):
    	try:
    		seed = int(sys.argv[1])
    	except:
    		print("An exception occurred")
    test(seed)