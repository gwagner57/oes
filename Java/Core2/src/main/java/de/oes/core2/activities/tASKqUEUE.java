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
	private static Simulator sim;
	private ArrayList<aCTIVITY> queue = new ArrayList<aCTIVITY>();

	public tASKqUEUE(Integer capacity, Simulator sim) {
		super();
		 // "capacity" is only used for Processing Nodes in PNs
		this.capacity = capacity;
		tASKqUEUE.sim = sim;
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
				sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).setWaitingTimeouts(sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getWaitingTimeouts() + 1);
				if(AT.getTasks().length() == 0) return false;
				else nextActy = AT.getTasks().get(0);
			}
		}
		// Are all required resources available?
		final aCTIVITY act = nextActy;
		if(
				AT.getResourceRoles().keySet().
				stream().
				// test only for resources not yet assigned
				filter(resRoleName -> act.getResourceRoles().containsKey(resRoleName)).
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
				
				// ***** Custom implementation in Java
				// Checks if some resources are already allocated for a next activity
				if(nextActy.get(resRoleName) != null && nextActy.get(resRoleName).size() > 0) {
					resQuantity -= nextActy.get(resRoleName).size(); // allocate the rest
				}
				// ***** 
				
				
				List<rESOURCE> allocatedRes = resRole.getResPool().allocate(resQuantity);
				if(allocatedRes != null && !allocatedRes.isEmpty()) { // individual resource pool
					// create an activity property slot for this resource role
					if(allocatedRes.size() == 1) {
						nextActy.put(allocatedRes.subList(0, 1), resRoleName);
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
	
	public void startOrEnqueue(aCTIVITY acty) {
		
		aCTIVITY AT = acty;//TODO
		
		if(!this.equals(acty.getTasks())) {
			System.err.println("Attempt to push an "+ acty.getName() +" to wrong queue!");
			return;
		}
		
		boolean actyStarted = tASKqUEUE.ifAvailAllocReqResAndStartNextActivity(AT, acty);
		if(!actyStarted) {
			acty.setEnqueueTime(sim.getTime());
			if(AT.getWaitingTimeoutFunc() != null) acty.setWaitingTimeout(sim.getTime().doubleValue() + AT.getWaitingTimeoutFunc().get().doubleValue());
			this.push(acty); // add acty to task queue
			Integer enqueuedActivities = sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getEnqueuedActivities();
			sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).setEnqueuedActivities(enqueuedActivities + 1);
			// compute generic queue length statistics per activity type
			if(this.length() > sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getQueueLength().getMax().intValue()) {
				sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getQueueLength().setMax(this.length());
			}
		}
	}
	
	public aCTIVITY dequeue() {
		//TODO?: compute average queue length statistics
		aCTIVITY acty = this.queue.remove(0);
		return acty;
	}

	public void clear() {
		this.queue.clear();
	}

	public int length() {
		return this.queue.size();
	}
	
	public void push(aCTIVITY act) {
		 this.queue.add(act);
	}
	
	public aCTIVITY get(int index) {
		 return this.queue.get(index);
	}
	
	
}
