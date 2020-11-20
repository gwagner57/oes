#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
import rand as rnd
import plots as plt

rand = rnd.Rand()

exponential_value = rand.exponential(0.5)
plt.make_plot( "Exponential", exponential_value )


gamma_value = rand.gamma(1.0, 2.0)
plt.make_plot( "Gamma", gamma_value )


normal_value = rand.normal(1.5, 0.5)
plt.make_plot( "Normal", normal_value )

uniform_value = rand.uniform(0.5, 1.5)
plt.make_plot( "Uniform", uniform_value )


uniformInt_value = rand.uniformInt(1, 40)
plt.make_plot( "UniformInt", uniformInt_value )

triangular_value = rand.triangular(0.5, 1.5, 1.0)
plt.make_plot( "Triangular", triangular_value )

pareto_value = rand.pareto(2.0)
plt.make_plot( "Pareto", pareto_value )


weibull_value = rand.weibull(1,0.5)
plt.make_plot( "Weibull", weibull_value )

frequency_value = rand.frequency({"20":1.4, "30":2.6 , "60":3.8, "80":1.9})
plt.make_plot( "Frequency", frequency_value )

pert_value = rand.pertdist(10, 190, 200)
plt.make_plot( "PertDistributiion", pert_value )