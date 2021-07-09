package de.oes.core2.activities;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import de.oes.core2.foundations.eVENT;
import de.oes.core2.lib.MathLib;
import de.oes.core2.sim.Simulator;

public class aCTIVITYsTART extends eVENT {

	private aCTIVITY plannedActivity;
	
	public aCTIVITYsTART(Simulator sim, Number occTime, Number delay, aCTIVITY plannedActivity) {
		super(sim, occTime, delay, null, null);
		this.plannedActivity = plannedActivity;
	}

	@Override
	public String toString() {
		String res = "{";
		for (List<rESOURCE> e : this.plannedActivity.getResources().values()) {
			for (rESOURCE rESOURCE : e) {
				res += rESOURCE.getName() + " ";
			}
		}
		res += "}";
		return this.plannedActivity.getClass().getSimpleName() + "Start" + res + "@" + this.getOccTime();
	}
	
	@Override
	public List<eVENT> onEvent() {
		List<eVENT> followupEvents = new ArrayList<eVENT>();
		aCTIVITY acty = this.plannedActivity; 
		String simpleName = acty.getClass().getSimpleName();
		aCTIVITY AT = this.getSim().getAClasses().get(simpleName);
		 // create slots for constructing new activity
		acty.setStartTime(this.getOccTime());
		
		if (acty.getDurationFunc() != null) {
		     acty.setDuration(acty.getDurationFunc().get());
		} 
	    // update statistics
		Integer startedActivities = this.
				getSim().
				getStat().
				getActTypes().
				get(simpleName).
				getStartedActivities();
		this.getSim().getStat().getActTypes().get(simpleName).
		setStartedActivities(
		Integer.valueOf(startedActivities.intValue() + 1));
		// Set activity state for all involved resource objects
		for (String resRoleName : acty.getResourceRoles().keySet()) { //TODO AT
			if(acty.getResourceRoles().get(resRoleName).getRange() != null) {  // an individual pool
				List<rESOURCE> resObjects = acty.get(resRoleName);
				for (rESOURCE resObj : resObjects) {
					if(resObj.getActivityState() == null) resObj.setActivityState(new aCTIVITYsTATE());
					resObj.getActivityState().add(AT.getClass().getSimpleName() + "-" + AT.getId());
				}
			}
		}
		// if there is an onActivityStart procedure, execute it
		if(acty.onActivityStart != null) {
			followupEvents.addAll(acty.onActivityStart.get());
		}
		// Schedule an activity end event if the duration is known
		if(acty.getDuration() != null) {
			followupEvents.add(new aCTIVITYeND(this.getSim(), MathLib.round(this.getOccTime().doubleValue()  + acty.getDuration().doubleValue()), null, null, null, acty));
		}
		return followupEvents;
	}

	@Override
	public String getSuccessorActivity() {
		// TODO Auto-generated method stub
		return null;
	}

}
