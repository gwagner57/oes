package de.oes.core0.endpoint.ui;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentsStatisticsDTO {
	Map <String, Map<String, Number>> sumStat;
	Map <Number, Map<String, Number>> experiments;
}
