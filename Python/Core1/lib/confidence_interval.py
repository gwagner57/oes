from numpy import mean
import math
import random

# Manuall implementation of confidence interval
def confInt ( data, samples = 10000, alpha = 0.95 ):
	n = samples
	p = alpha
	mu = [0] * n
	m = mean( data )
	l = len( data )
	for i in range( n ):
		t = 0
		for j in range( l ):
			t += data[ math.floor( random.random() * l ) ]
		mu[ i ] = ( t / l ) - m
	mu.sort()
	lowerBound = m - mu[ math.floor( min( n - 1, n * ( 1 - ( ( 1 - p ) / 2 ) ) ) ) ]
	upperBound = m - mu[ math.floor( max( 0, n * ( ( 1 - p ) / 2 ) ) ) ]
	return lowerBound, upperBound

lowerBound, upperBound = confInt( [ 1,2,3,4,5 ], 10000, 0.95 )
print( lowerBound, upperBound )
