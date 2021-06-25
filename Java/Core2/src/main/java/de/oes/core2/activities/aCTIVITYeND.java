package de.oes.core2.activities;

import java.util.ArrayList;

import java.util.List;
import java.util.Map;
import java.util.Set;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.sim.GenericStat;
import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class aCTIVITYeND extends eVENT {
	private aCTIVITY activity;
	
	public aCTIVITYeND(Simulator sim, Number occTime, Number delay, Number startTime, Number duration, de.oes.core2.activities.aCTIVITY activity) {
		super(sim, occTime, delay, startTime, duration);
		this.activity = activity;
	}
	
	public aCTIVITYeND(Simulator sim) {
		super(sim);
	}
	
	
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		Simulator sim = this.getSim();
		aCTIVITY acty = this.activity; 
		aCTIVITY AT = acty; // the activity's type/class
		GenericStat waitingTimeStat = sim.getStat().
									getActTypes().
									get(AT.getClass().getSimpleName()).
									getWaitingTime();
		GenericStat cycleTimeStat = sim.getStat().
										getActTypes().
										get(AT.getClass().getSimpleName()).
										getCycleTime();
		Map<String, Number> resUtilPerAT = sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getResUtil();
		
		// if there is an onActivityEnd procedure, execute it
		if(acty.onActivityEnd != null) {
			followupEvents.addAll(acty.onActivityEnd.get());
		}
		acty.setOccTime(this.getOccTime());
		
		// set duration if there was no pre-set duration
		if(acty.getDuration() == null) {
			acty.setDuration(acty.getOccTime().doubleValue() - acty.getStartTime().doubleValue());
		}
		
		Integer completedActivities = sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).getCompletedActivities();
		 sim.getStat().getActTypes().get(AT.getClass().getSimpleName()).setCompletedActivities(completedActivities + 1);
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
					Number ru = resUtilPerAT.get(resObj.getId().toString());
					resUtilPerAT.put(resObj.getId().toString(), ru.doubleValue() + acty.getDuration().doubleValue());
					 // update the activity state of resource objects
					resObj.getActivityState().delete(AT.getName());
				}
			} else { // per count pool
				resUtilPerAT.put(resRole.getCountPoolName(), resUtilPerAT.get(resRole.getCountPoolName()).doubleValue() + acty.getDuration().doubleValue());
			}
		}
		// enqueue or schedule a successor activity according to the process model
		if(AT.getSuccessorActivity() != null) { // a string or a function returning a string
			aCTIVITY SuccAT = this.getSim().getAClasses().get(AT.getSuccessorActivity());
			aCTIVITY succActy = SuccAT.newInstance();
			
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
			
			
			// TODO : it was outside the "if" condition, 
			// but then not all resources are released at the right moment
			// release all (remaining) resources of acty
			releaseResources(acty, AT);
			
			// are all successor activity resources already allocated (since included in activity resources)?
			if(succActyResRoleNames.stream().allMatch(rn -> actyResRoleNames.contains(rn))) {
				 // start successor activity
		        followupEvents.add(new aCTIVITYsTART(sim, null, null, succActy));
			} else {
				SuccAT.getTasks().startOrEnqueue(succActy);
			}
		} else {
			releaseResources(acty, AT);
		}
		
		// if there are still planned activities of type AT
		if(AT.getTasks().length() > 0) {
			// if available, allocate required resources and schedule next activity
			tASKqUEUE.ifAvailAllocReqResAndStartNextActivity(AT, null);
		}
		
		return followupEvents;
	}

	private void releaseResources(aCTIVITY acty, aCTIVITY AT) {
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
	}

	@Override
	public String getSuccessorActivity() {
		return null;
	}

	@Override
	public String toString() {
		String res = "{";
		for (List<rESOURCE> e : this.activity.getResources().values()) {
			for (rESOURCE rESOURCE : e) {
				res += rESOURCE.getName() + " ";
			}
		}
		res += "}";
		return this.activity.getClass().getSimpleName() + "End" + res + "@" + this.getOccTime();
	}

}
