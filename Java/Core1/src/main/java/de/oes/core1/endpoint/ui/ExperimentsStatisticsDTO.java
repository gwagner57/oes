package de.oes.core1.endpoint.ui;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentsStatisticsDTO {
	Map <String, Map<String, Number>> sumStat;
	Map <Number, Map<String, Number>> experiments;
	List<List<Object>> paramVal;
}
