package de.oes.core2.lib;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import de.oes.core2.foundations.eVENT;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventList {
	
	private static final Comparator<eVENT> SORT_BY_NEAREST_OCCTIME = Comparator.comparing(eVENT::getOccTime, (n1, n2) -> {
		BigDecimal b1 = new BigDecimal(n1.doubleValue());
	    BigDecimal b2 = new BigDecimal(n2.doubleValue());
		return b1.compareTo(b2);
	});
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
	
	public Double getNextOccurrenceTime() {
		if (!this.isEmpty()) {
			return this.events.get(0).getOccTime().doubleValue();
		}
		return Double.valueOf(0);
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
		Number nextTime = this.events.get(0).getOccTime();
		while(this.events.size() > 0 && this.events.get(0).getOccTime() == nextTime) {
			nextEvents.add(this.events.remove(0));
		}
		return nextEvents;
	}
}
