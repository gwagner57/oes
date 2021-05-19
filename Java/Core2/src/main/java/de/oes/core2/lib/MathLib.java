package de.oes.core2.lib;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;


public class MathLib {
	
	public static Map<String, Function<Number[], Number>> summary = initSummaryMap();
	
	
	public static Double mean(Number[] data) {
		return MathLib.sum(data).doubleValue() / data.length;
	}
	
	private static Map<String, Function<Number[], Number>> initSummaryMap() {
		Map<String, Function<Number[], Number>> summaryMap = new HashMap<String, Function<Number[], Number>>();
		summaryMap.put("Average", MathLib::mean);
		summaryMap.put("Std.dev.", MathLib::stdDev);
		summaryMap.put("Minimum", MathLib::min);
		summaryMap.put("Maximum", MathLib::max);
		summaryMap.put("CI Lower", MathLib::CIlower);
		summaryMap.put("CI Upper", MathLib::CIupper);
		return summaryMap;
	}
	
	/**
	 *
	 * @return int[]{lower, upper}, i.e. int array with Lower and Upper Boundary of the 95% Confidence Interval for the given numbers
	 */
	public static double[] calculateLowerUpperConfidenceBoundary95Percent(Number [] givenNumbers) {

	    // calculate the mean value (= average)
	    double sum = 0.0;
	    for (Number n : givenNumbers) {
	        int num = n.intValue();
	    	sum += num;
	    }
	    double mean = sum / givenNumbers.length;

	    // calculate standard deviation
	    double squaredDifferenceSum = 0.0;
	    for (Number n : givenNumbers) {
	    	int num = n.intValue();
	        squaredDifferenceSum += (num - mean) * (num - mean);
	    }
	    double variance = squaredDifferenceSum / givenNumbers.length;
	    double standardDeviation = Math.sqrt(variance);

	    // value for 95% confidence interval, source: https://en.wikipedia.org/wiki/Confidence_interval#Basic_Steps
	    double confidenceLevel = 1.96;
	    double temp = confidenceLevel * standardDeviation / Math.sqrt(givenNumbers.length);
	    return new double[]{mean - temp, mean + temp};
	}
	
	public static Number CIlower(Number[] data) {
		return MathLib.round(MathLib.calculateLowerUpperConfidenceBoundary95Percent(data)[0]);
	}
	
	public static Number CIupper(Number[] data) {
		return MathLib.round(MathLib.calculateLowerUpperConfidenceBoundary95Percent(data)[1]);
	}
	
	public static Number min(Number[] data) {
		return Stream.of(data).min((x,y) -> Double.compare(x.doubleValue(), y.doubleValue())).get();
	}
	
	public static Number max(Number[] data) {
		return Stream.of(data).max((x,y) -> Double.compare(x.doubleValue(), y.doubleValue())).get();
	}
	
	public static Number stdDev(Number[] data) {
		Double m = MathLib.mean(data);
		Double standardDeviation = Double.valueOf(0);
		for(Number num: data) {
	            standardDeviation += Math.pow(num.doubleValue() - m, 2);
	        }
		return round(Math.sqrt(standardDeviation / data.length));
	}
	
	public static Number sum(Number[] data) {
		Number sum = 0;
		for (Number number : data) {
			sum = sum.doubleValue() + number.doubleValue();
		}
		return sum;
	}
	/**
	 * Compute the Cartesian Product of an array of arrays
	 * From https://stackoverflow.com/a/40202076
	 * @param {Array} arr - An array of arrays of values to be combined
	 */
	public static int[][] cartesianProduct(int[] s1, int[] s2) { 
	    List<int[]> list = new ArrayList<>();
	    for (int v1: s1) {
	        for (int v2: s2) {
	            list.add(new int[]{v1, v2});
	        }
	    }
	    int[][] result = new int[list.size()][2];
	    int k=0;
	    for(int[] i: list){
	        result[k++] = i;
	    }   
	    return result;
	}
	
	
	/**
	 * Compute the Cartesian Product of arbitrary sets
	https://stackoverflow.com/questions/714108/cartesian-product-of-arbitrary-sets-in-java
	*/
	public static Set<Set<Object>> cartesianProduct(Set<?>... sets) {
	    if (sets.length < 2)
	        throw new IllegalArgumentException(
	                "Can't have a product of fewer than two sets (got " +
	                sets.length + ")");

	    return _cartesianProduct(0, sets);
	}
	
	public static <T> List<List<T>> cartesianProduct(List<List<T>> lists) {
	    List<List<T>> resultLists = new ArrayList<List<T>>();
	    if (lists.size() == 0) {
	        resultLists.add(new ArrayList<T>());
	        return resultLists;
	    } else {
	        List<T> firstList = lists.get(0);
	        List<List<T>> remainingLists = cartesianProduct(lists.subList(1, lists.size()));
	        for (T condition : firstList) {
	            for (List<T> remainingList : remainingLists) {
	                ArrayList<T> resultList = new ArrayList<T>();
	                resultList.add(condition);
	                resultList.addAll(remainingList);
	                resultLists.add(resultList);
	            }
	        }
	    }
	    return resultLists;
	}

	private static Set<Set<Object>> _cartesianProduct(int index, Set<?>... sets) {
	    Set<Set<Object>> ret = new HashSet<Set<Object>>();
	    if (index == sets.length) {
	        ret.add(new HashSet<Object>());
	    } else {
	        for (Object obj : sets[index]) {
	            for (Set<Object> set : _cartesianProduct(index+1, sets)) {
	                set.add(obj);
	                ret.add(set);
	            }
	        }
	    }
	    return ret;
	}
	
	/**
	 * Rounds a double @value to 2 decimal places
	 * @param value
	 * @return
	 */
	public static double round(double value) {
	    BigDecimal rounded = BigDecimal.valueOf(value);
    	rounded = rounded.setScale(2, RoundingMode.HALF_DOWN);
	    return rounded.doubleValue();
	}

	// Returns a random integer between min (included) and max (included)
	public static int getUniformRandomInteger(int min, int max) {
		return (int) Math.floor(Math.random() * (max - min + 1)) + min;
	}

	public static double getUniformRandomNumber(double min, double max) {
		return Math.random() * (max - min + 1) + min;
	}
}
