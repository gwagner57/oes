#!/usr/bin/env python -W ignore::DeprecationWarning
import math
import random
import rand as rnd
import plots as plt

rand = rnd.Rand(1234)


exponential_value = rand.exponential(0.5)
plt.make_plot("Exponential", exponential_value)


gamma1_value = rand.gamma1(1.0, 2.0)
plt.make_plot("Gamma", gamma1_value)


normal_value = rand.normal(1.5, 0.5)
plt.make_plot("Normal", normal_value)

uniform1_value = rand.uniform1(0.5, 1.5)
plt.make_plot("Uniform", uniform1_value)


uniformInt_value = rand.uniformInt(1, 6)
plt.make_plot("UniformInt", uniformInt_value)

triangular_value = rand.triangular(0.5, 1.5, 1.0)
plt.make_plot("Triangular", triangular_value)

pareto1_value = rand.pareto1(2.0)
plt.make_plot("Pareto", pareto1_value)


weibull1_value = rand.weibull1(1,0.5)
plt.make_plot("Weidbull", weibull1_value)

frequency1_value = rand.frequency1({"20":1.4, "30":2.6 , "60":3.8, "80":1.9})
plt.make_plot("Frequency", frequency1_value)

pert_value = rand.pertdist1(10,190,200)
plt.make_plot("pertdistributiion",pert_value)