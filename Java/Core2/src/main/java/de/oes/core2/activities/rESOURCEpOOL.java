package de.oes.core2.activities;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import de.oes.core2.sim.Simulator;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class rESOURCEpOOL {
	/****************************************************************************
	 A resource pool can take one of two forms:
	   (1) a count pool abstracts away from individual resources and just maintains
	       an "available" counter of the available resources of some type
	   (2) an individual pool is a collection of individual resource objects
	 For any performer role (defined in an activity type definition), an individual
	 pool is defined with a (lower-cased and pluralized) name obtained from the
	 role's range name if it's a position or, otherwise, from the closest position
	 subtyping the role's range
	 ****************************************************************************/
	
	private String name;
	private rANGE resourceType;
	private Integer available;
	private List<rESOURCE> resources;
	private List<rESOURCE> busyResources;
	private List<rESOURCE> availResources;
	private List<Class<? extends Object>> dependentActivityTypes;
	private Simulator sim;
	

	public rESOURCEpOOL(Simulator sim, String name, rANGE resourceType, Integer available, List<rESOURCE> resources) {
		super();
		this.name = name;
		this.sim = sim;
		if(Objects.nonNull(available)) {
			this.available = available;
		} else if (Objects.nonNull(resourceType)) {
			this.resourceType = resourceType;
			this.busyResources = new ArrayList<rESOURCE>(); 
			this.availResources = new ArrayList<rESOURCE>(); 
		} else {
			System.err.println("Resource pool " + name + " is not well-defined!");
		}
		this.dependentActivityTypes = new ArrayList<Class<? extends Object>>();
		if(resources != null && !resources.isEmpty()) {
			for (rESOURCE res : resources) {
				if(res.getStatus() == rESOURCEsTATUS.AVAILABLE) this.availResources.add(res);
				if(res.getStatus() == rESOURCEsTATUS.BUSY) this.busyResources.add(res);
			}
		}
	}
	
	public boolean isAvailable(Integer card) {
		if(card == null) card = 1;
		if(this.available == null) { // individual pool
			if(this.availResources.size() >= card) return true;
			// check if there are alternative resources
			List<Class<? extends rESOURCE>> altResTypes = this.resourceType.getAlternativeResourceTypes();
			if(altResTypes != null && altResTypes.size() > 0) {
//TODO			const rP = sim.Classes[altResTypes[0]].resourcePool;
				rESOURCEpOOL rP = null;
		        return rP != null && rP.isAvailable(card);
			} else return false;
		} else return this.available >= card;
	}
	
	public int nmrAvailable() {
		return this.availResources.size();
	}
	
	public List<rESOURCE> allocateAll() {
		if(availResources != null && !this.availResources.isEmpty()) { // individual pool
			List<rESOURCE> allocatedRes = List.copyOf(this.availResources);
			for(rESOURCE res : this.availResources) {
				res.setStatus(rESOURCEsTATUS.BUSY);
				this.busyResources.add(res);
			}
			this.availResources = new ArrayList<rESOURCE>();
			return allocatedRes;
		} else available = 0;
		return availResources;
	}
	
	public List<rESOURCE> allocate(Integer card) {
		rESOURCEpOOL rp = null;
		
		if(card == null) card = 1;
		
		if(this.availResources != null) {
			if(this.availResources.size() >= card) {
				rp = this;
			} else {
				List<Class<? extends rESOURCE>> altResTypes = this.resourceType.getAlternativeResourceTypes();
				if(altResTypes != null && !altResTypes.isEmpty()) {
					 //TODO: use all altResTypes, not just altResTypes[0]
//	TODO			rP = sim.Classes[altResTypes[0]].resourcePool;
					if(rp != null && !rp.isAvailable(card)) rp = null;
				}
			}
		
		if(rp == null) {
			System.err.println("The pool " +  this.name + " does not have enough at simulation step " + this.sim.getStep());
			return new ArrayList<rESOURCE>();
		}
		
		if(rp != this) {
			System.err.println("Allocate" + this.getResourceType().getName() + " from pool " + rp.getName());
		}
		
		// remove the first card resources from availResources
		List<rESOURCE> allocatedRes = rp.getAvailResources().subList(0, card);
		for (int i = 0; i < card; i++) {
			rp.getAvailResources().remove(0);
		}
	
		for (rESOURCE res : allocatedRes) {
			res.setStatus(rESOURCEsTATUS.BUSY);
			rp.getBusyResources().add(res);
		}
		return allocatedRes;
	} else this.available -= card;
	
		return new ArrayList<rESOURCE>();
	}

	
	public void release(Integer nmrOfRes) { // number or resource(s)
		if(nmrOfRes == null) nmrOfRes = 1;
		this.available += nmrOfRes;
	}
	
	public void release(List<rESOURCE> resources) { // number or resource(s)
		for (rESOURCE res : resources) {
			rESOURCEpOOL rP = res.getResourcePool();
			int i = rP.getBusyResources().indexOf(res);
			if(i == -1) {
				System.err.println("The pool " + rP.name + "does not contain resource " + res.toString() + " at simulation step " + sim.getStep());
				return;
			}
			// try starting enqueued tasks depending on this type of resource
//			for(aCTIVITY AT : this.dependentActivityTypes) {
//				tASKqUEUE.ifAvailAllocReqResAndStartNextActivity(AT, null); TODO
//			}
		}
	}
	
	public void clear() {
		if(this.available == null) {
			this.busyResources = new ArrayList<rESOURCE>();
			this.availResources = new ArrayList<rESOURCE>();
		} else {
			this.available = 0;
		}
	}
	
	@Override
	public String toString() {
		if(this.available == null) {
			Object availRes = this.availResources.stream().map(r -> r.getName() == null ? r.getId() : r.getName());
			return "av." + this.name + ":" + availRes;
		} else {
			return "av." + this.name + ":" + this.available;
		}
	}
}
