# python implementation of the math functions from the math.js file
# Status: Almost finished
import statistics
import random
import itertools

def cartesianProduct(arr):
    result = []
    for element in itertools.product(*arr):
        result.append(element)
    return (result)

def mathRound(x,d):
    return round(x,d)

def mathSum(data):
    return sum(data)

def mathMax(data):
    return max(data)

def mathMin(data):
    return min(data)

def mean(data):
    return sum(data) / len(data)

def stdDev(data):
    return statistics.stdev(data)

def getUniformRandomNumber(min, max):
    return random.uniform(min, max)

def getUniformRandomInteger(min, max):
    return random.randint(min, max)

# To be implemented later
def confInt(data, samples = 10000, alpha = 0.95):
    pass

# Test Statments for the implmented functions. Uncomment to test the functionality
#print("Testing the Cartesian Product Function", cartesianProduct([[1,2,3],[4,5,6],[7,8,9]]))
#print("Testing the Round Function", mathRound(2.26543,3))
#print("Testing the Sum Function", mathSum([1,2,3]))
#print("Testing the Max Function", mathMax([1,2,3]))
#print("Testing the Min Function", mathMin([1,2,3]))
#print("Testing the Mean Function", mean([1,2,3]))
#print("Testing the Standard Deviation Function", stdDev([1,2,3]))
#print("Testing the Random Integer Function", getUniformRandomNumber(1,3))
#print("Testing the Random Integer Function", getUniformRandomInteger(1,3))