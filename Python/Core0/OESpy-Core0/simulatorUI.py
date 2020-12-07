from pprint import pprint
def logSimulationStep(sim):
    print("\n\n-------------------- Log Simulation Step " + str(sim.step) + " --------------------------")
    print("Step Information ******************************************************")
    print("Step:", sim.step, "Time:", round(sim.time, 2), "End Time:", sim.endTime)
    
    print("\nObject Information ****************************************************")
    print (sim.objects["tvShop"])
    
    print("\nEvent Information *****************************************************")
    for event in sim.FEL.events:
        print(event)   
