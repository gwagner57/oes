package de.oes.core2.dto;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentsStatisticsDTO {
	Map <String, Map<String, Number>> sumStat;
	Map<String, Map<String, Map<String, Number>>> actStat;
	Map <Number, Map<String, Number>> experiments;
	List<List<Object>> paramVal;
}
