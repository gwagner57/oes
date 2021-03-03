package de.oes.core0.lib;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import de.oes.core0.foundations.eVENT;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventList {
	
	private static final Comparator<eVENT> SORT_BY_NEAREST_OCCTIME = Comparator.comparing(eVENT::getOccTime);
	private List<eVENT> events = new ArrayList<eVENT>();
	
	public EventList(List<eVENT> events) {
		super();
		this.events = events;
	}

	public EventList() {
		super();
	}
	
	public void add(eVENT e) {
		this.events.add(e);
		if(this.events.size() > 1) {
			this.events.sort(SORT_BY_NEAREST_OCCTIME);
		}
	}
	
	public Long getNextOccurrenceTime() {
		if (!this.isEmpty()) {
			return this.events.get(0).getOccTime();
		}
		return 0l;
	}
	
	public eVENT getNextEvent() {
		if (!this.isEmpty()) {
			return this.events.get(0);
		}
		return null;
	}
	
	public boolean isEmpty() {
		return this.events.isEmpty();
	}
	
	public void clear() {
		this.events.clear();
	}
	
	public List<eVENT> removeNextEvents() {
		List<eVENT> nextEvents = new ArrayList<eVENT>();
		if (this.isEmpty()) {
			return nextEvents;
		}
		Long nextTime = this.events.get(0).getOccTime();
		while(this.events.size() > 0 && this.events.get(0).getOccTime() == nextTime) {
			nextEvents.add(this.events.remove(0));
		}
		return nextEvents;
	}
}
