package de.oes.core2.lib;
import java.util.Collection;
import java.util.Map;
import java.util.Random;

import org.apache.commons.math3.distribution.*;
import org.apache.commons.math3.random.Well19937c;
import org.apache.commons.math3.stat.Frequency;


public class Rand {
	
	private static Well19937c rng;
	
	public static Number exponential(double mean, double sigma, int seed) {
		return new ExponentialDistribution(rng, mean, 1.0E-9D).sample();
	}
	
	public static Number exponential(double lambda) {
		 var r = rng.nextDouble();
		 return -Math.log(r) / lambda;
	}
	
	
	public static Number gamma(double alpha, double beta, int seed) {
		return new GammaDistribution(rng, alpha, beta).sample();
	}
	
	public static Number normal(double mean, double stdDev, int seed) {
		return new LogNormalDistribution(rng, mean, stdDev).sample();
	}
	
	public static Number uniform(double lowerBound, double upperBound ) {
		return new UniformRealDistribution(rng, lowerBound, upperBound).sample();
	}
	
	public static Number uniformInt(double lowerBound, double upperBound ) {
		return (int) new UniformRealDistribution(rng, lowerBound, upperBound).sample();
	}
	
	public static Number triangular(double lowerBound, double upperBound, double mode) {
		return new TriangularDistribution(rng, lowerBound, mode, upperBound).sample();
	}
	
	public static Number triangular(double scale, double shape) {
		return new ParetoDistribution(rng, scale, shape).sample();
	}
	
	public static Number weibull(double alpha, double beta) {
		return new WeibullDistribution(rng, alpha, beta).sample();
	}
	
	public long frequency(Map<String, Number> freqMap) {
		Frequency frequency = new Frequency();
		Collection<Number> values = freqMap.values();
		for (Number number : values) {
			frequency.addValue(number.intValue());
		}
		return frequency.getCumFreq(1);
	}
	/**
	 * Shuffles array in place using the Fisher-Yates shuffle algorithm
	 * @param {Array} a - An array of items to be shuffled
	 */
	 static int[] randomize( int a[]) { 
	        Random r = new Random(); 
	        for (int i = a.length - 1; i > 0; i--) { 
	            int j = r.nextInt(i + 1); 
	            int x = a[i]; 
	            a[i] = a[j]; 
	            a[j] = x; 
	        } 
	        return a;
	    }

	public static void setRng(Well19937c rng) {
		Rand.rng = rng;
	} 
}
