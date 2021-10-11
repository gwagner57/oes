package de.oes.core2.activities;

import java.util.HashSet;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class aCTIVITYsTATE {
	private Set<String> set = new HashSet<String>();
	
	public void add(String name) {
		this.set.add(name);
	}
	
	public void delete(String name) {
		this.set.remove(name);
	}

	@Override
	public String toString() {
		return "[set=" + set + "]";
	}
	
}
