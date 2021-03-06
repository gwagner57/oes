package de.oes.core0.sim;

import de.oes.core0.foundations.eVENT;

public class SimulatorUI {

	public static void logSimulationStep(Simulator sim) {
	  System.out.println("\n-------------------- Log Simulation Step " + sim.getStep() + " ---------------------------");
	    System.out.println("Step Information *******************************************************");
	    System.out.println("-> Step:" + sim.getStep() + " Time:" + sim.getTime() + " End Time:" + sim.getEndTime());
	    
	    System.out.println("\nObject Information *****************************************************");
	    System.out.println (sim.getObjects());
	    
	    System.out.println("\nEvent Information ******************************************************");
	    for(eVENT e : sim.getFEL().getEvents()) {
	    	System.out.println(e);
	    }
	 
	}
}
