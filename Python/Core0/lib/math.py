# python implementation of the math functions from the math.js file
# Status: Almost finished
from statistics import stdev, fmean as mean
from random import randint, uniform
from itertools import product

def cartesianProduct(arr):
    result = []
    for element in product(*arr):
        result.append(element)
    return (result)

def getUniformRandomNumber(min, max):
    return uniform(min, max)

def getUniformRandomInteger(min, max):
    return randint(min, max)

# To be implemented later
def confInt(data, samples = 10000, alpha = 0.95):
    pass

# Test Statments for the needed functions. Uncomment to test the functionality
#print("Testing the Cartesian Product Function", cartesianProduct([[1,2,3],[4,5,6],[7,8,9]]))
#print("Testing the Round Function", round(2.26543,3))
#print("Testing the Sum Function", sum([1,2,3]))
#print("Testing the Max Function", max([1,2,3]))
#print("Testing the Min Function", min([1,2,3]))
#print("Testing the Mean Function", mean([1,2,3]))
#print("Testing the Standard Deviation Function", stdev([1,2,3]))
#print("Testing the Random Integer Function", getUniformRandomNumber(1,3))
#print("Testing the Random Integer Function", getUniformRandomInteger(1,3))