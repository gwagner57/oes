package de.oes.core2.foundations;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import de.oes.core2.sim.GenericStat;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class aCTIVITYeND extends eVENT {
	private aCTIVITY activity;
	
	public aCTIVITYeND(Simulator sim, Number occTime, Number delay, Number startTime, Number duration, de.oes.core2.foundations.aCTIVITY activity) {
		super(sim, occTime, delay, startTime, duration);
		this.activity = activity;
	}

	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		aCTIVITY AT = this.activity;
		aCTIVITY acty = AT; //FIXME
		GenericStat waitingTimeStat = sim.getStat().
									getActTypes().
									get(AT.getName()).
									getWaitingTime();
		GenericStat cycleTimeStat = sim.getStat().
										getActTypes().
										get(AT.getName()).
										getCycleTime();
		Map<String, Number> resUtilPerAT = sim.getStat().getActTypes().get(AT.getName()).getResUtil();
		
		if(acty.onActivityStart != null) {
			followupEvents.addAll(acty.onActivityStart);
		}
		
		// set duration if there was no pre-set duration
		if(acty.getDuration() == null) {
			acty.setDuration(acty.getOccTime().doubleValue() - acty.getStartTime().doubleValue());
		}
		
		sim.incrementStat(AT.getName() + ".completedActivities", 1);
		Double waitingTime = acty.getEnqueueTime() != null ? acty.getStartTime().doubleValue() - acty.getEnqueueTime().doubleValue() : 0;
		
		//waitingTimeStat.total += waitingTime;
		if (waitingTimeStat.getMax().doubleValue() < waitingTime) waitingTimeStat.setMax(waitingTime);
		
		Double cycleTime = waitingTime + acty.getOccTime().doubleValue() - acty.getStartTime().doubleValue();
		if(cycleTimeStat.getMax().doubleValue() < cycleTime) cycleTimeStat.setMax(cycleTime);
		
		for (String resRoleName : AT.getResourceRoles().keySet()) {
			rESOURCErOLE resRole = AT.getResourceRoles().get(resRoleName);
			if(resRole.getRange() != null) {
				List<rESOURCE> resObjects = acty.get(resRoleName);
				for (rESOURCE resObj : resObjects) {
					resUtilPerAT.put(resObj.getId().toString(), acty.getDuration());
					 // update the activity state of resource objects
					resObj.getActivityState().delete(AT.getName());
				}
			} else { // per count pool
				resUtilPerAT.put(resRole.getCountPoolName(), acty.getDuration());
			}
		}
		// enqueue or schedule a successor activity according to the process model
		if(AT.getSuccessorActivity() != null) { // a string or a function returning a string
//			 const SuccAT = typeof AT.successorActivity === "function" ?
//                     sim.Classes[AT.successorActivity()] : sim.Classes[AT.successorActivity],
			aCTIVITY succActy = null; //TODO
			aCTIVITY SuccAT = succActy; //TODO
			
			Set<String> succActyResRoleNames = SuccAT.getResourceRoles().keySet();
			Set<String> actyResRoleNames = AT.getResourceRoles().keySet();
			// By default, keep (individual) resources that are shared between AT and SuccAT
			for (String resRoleName : actyResRoleNames) {
				if (SuccAT.getResourceRoles().containsKey(resRoleName) && acty.get(resRoleName) != null) {
			          // re-allocate resource to successor activity
					  succActy.put(acty.get(resRoleName), resRoleName);
					  acty.delete(resRoleName);
			        }
			}
			// are all successor activity resources already allocated (since included in activity resources)?
			if(succActyResRoleNames.stream().allMatch(rn -> actyResRoleNames.contains(rn))) {
				 // start successor activity
		        followupEvents.add(new aCTIVITYsTART(sim, null, null, succActy));
			} else {
				SuccAT.getTasks().startOrEnqueue(succActy);
			}
		}
		// release all (remaining) resources of acty
		for (String resRoleName : AT.getResourceRoles().keySet()) {
			rESOURCErOLE resRole = AT.getResourceRoles().get(resRoleName);
			if(resRole.getCountPoolName() != null) {
				 // release the used number of count pool resources
				resRole.getResPool().release(resRole.getCard());
			} else {
				// release the used individual resource if it has not been transferred to succActy
				if(acty.get(resRoleName) != null) resRole.getResPool().release(acty.get(resRoleName));
			}
		}
		// if there are still planned activities of type AT
		if(AT.getTasks().length() > 0) {
			// if available, allocate required resources and schedule next activity
			tASKqUEUE.ifAvailAllocReqResAndStartNextActivity(AT, null);
		}
		
		return followupEvents;
	}

}
