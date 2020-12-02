def logSimulationStep(sim):
    print("\n-------------------- Log Simulation Step --------------------")
    print(" step:", sim.step)
    print(" time:", round(sim.time, 2))
    print(" FEL: ", sim.FEL.events)