from pprint import pprint
def logSimulationStep(sim):
    print("\n\n-------------------- Log Simulation Step " + str(sim.step) + " --------------------------")
    print("Step Information ******************************************************")
    print("Step:", sim.step, "Time:", round(sim.time, 2), "End Time:", sim.endTime)
    
    print("\nObject Information ****************************************************")
    print("Objects:", sim.objects)
    print("Labels:", sim.objects["tvShop"].labels)
    
    print("\nEvent Information *****************************************************")
    labels = []
    for event in sim.FEL.events:
        labels.append(event.labels)   
    print("FEL:")
    pprint(sim.FEL.events)
    print("Labels:", labels)