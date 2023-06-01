from pprint import pprint
def logSimulationStep(sim):
    print('\n'+ str(sim.step) +" / "+ "{:.2f}".format(sim.time) +": ", end='')
    for obj in sim.objects.values(): print( obj, end='')
    print(" | ", end='')
    for event in sim.FEL.events: print( event, ", ", sep='', end='')


