package de.oes.core2.activities;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Queue;

import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

//Define a datatype class for queues of tasks (= planned activities)
@Getter
@Setter
public class tASKqUEUE {
	private Integer capacity;
	private Simulator sim;
	private ArrayList<aCTIVITY> queue = new ArrayList<aCTIVITY>();

	public tASKqUEUE(Simulator sim, Integer capacity) {
		super();
		 // "capacity" is only used for Processing Nodes in PNs
		this.capacity = capacity;
	}
	
	  /*
	   When no activity (acty) is provided, the head of the AT queue is used
	   */
	public static boolean ifAvailAllocReqResAndStartNextActivity(aCTIVITY AT, aCTIVITY acty) {
		aCTIVITY nextActy = null;
		if(Objects.nonNull(acty)) nextActy = acty;
		else {
			if(AT.getTasks().length() == 0) return false;
			nextActy = AT.getTasks().get(0);
			// take care of waiting timeouts
			while(Objects.nonNull(nextActy.getWaitingTimeout()) && sim.getTime().doubleValue() > nextActy.getWaitingTimeout().doubleValue()) {
				// remove nextActy from queue
				AT.getTasks().dequeue();
				// increment the waitingTimeouts statistic
				sim.incrementStat(AT.getName() + ".waitingTimeouts", 1);
				if(AT.getTasks().length() == 0) return false;
				else nextActy = AT.getTasks().get(0);
			}
		}
		// Are all required resources available?
		if(
				AT.getResourceRoles().keySet().
				stream().
				// test only for resources not yet assigned
				filter(resRoleName -> nextActy.getResourceRoles().containsKey(resRoleName)).
				map(resRoleName -> AT.getResourceRoles().get(resRoleName)).
				allMatch(resRole -> resRole.getResPool().isAvailable(resRole.getCard() != null ? resRole.getCard() : resRole.getMinCard()))) 
		{
			// remove nextActy from queue
			if(acty == null) AT.getTasks().dequeue();
			// Allocate all required resources
			for (String resRoleName : AT.getResourceRoles().keySet()) {
				rESOURCErOLE resRole = AT.getResourceRoles().get(resRoleName);
				// allocate the required/maximal quantity of resources from the pool
				Integer resQuantity=0;
				if(resRole.getCard() != null) resQuantity = resRole.getCard();
				else if(resRole.getMaxCard() != null) {
					resQuantity = Math.min(resRole.getMaxCard(), resRole.getResPool().getAvailable());
				}
				List<rESOURCE> allocatedRes = resRole.getResPool().allocate(resQuantity);
				if(allocatedRes != null && !allocatedRes.isEmpty()) { // individual resource pool
					// create an activity property slot for this resource role
					if(allocatedRes.size() == 1) {
						nextActy.put(List.of(allocatedRes.get(0)), resRoleName);
					} else {
						nextActy.put(allocatedRes, resRoleName);
					}
				}
			}
			// start next activity with the allocated resources
			sim.getFEL().add(new aCTIVITYsTART(sim, null, null, nextActy));
			return true;
		} else {
			return false;
		}
	}
	
	public void startOrEnqueue(aCTIVITY activity) {
		
	}
	
	public void dequeue() {
		// TODO Auto-generated method stub
		
	}
	
	public void clear() {
		this.queue.clear();
	}

	public int length() {
		return this.queue.size();
	}
	
	public aCTIVITY get(int index) {
		 return this.queue.get(index);
	}
	
	
}
