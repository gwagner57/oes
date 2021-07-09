package de.oes.core2.endpoint.ui;

import java.util.List;
import java.util.Map;

import de.oes.core2.sim.ReplicationActivityStat;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentsStatisticsDTO {
	Map <String, Map<String, Number>> sumStat;
	Map <String, ReplicationActivityStat> actStat;
	Map <Number, Map<String, Number>> experiments;
	List<List<Object>> paramVal;
}
