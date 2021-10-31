package de.oes.core2.sim;

import java.util.HashMap;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class ReplicationStat {
		private Map <String, ReplicationActivityStat> actTypes;
		private Map <String, Number[]> simpleStat = new HashMap <String, Number[]>();
}
