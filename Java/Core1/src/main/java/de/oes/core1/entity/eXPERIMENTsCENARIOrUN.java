package de.oes.core1.entity;

import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MapKeyColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "expscenariorun")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType.class)
@NoArgsConstructor
public class eXPERIMENTsCENARIOrUN {

	public static final String ID = "id";
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="id")
	private long id;
	
	@Transient
	private eXPERIMENTrUN experimentRun;
	
	private Long experimentScenarioNo;
	
	@ElementCollection(targetClass=String.class)
	@MapKeyColumn(name="parameterValueCombination")
	private List<Object> parameterValueCombination;
	
	@Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
	private Map<String, Number> outputStatistics;
	
	public eXPERIMENTsCENARIOrUN(long id, eXPERIMENTrUN experimentRun, 
			Long experimentScenarioNo, List<Object> parameterValueCombination,
			Map<String, Number> outputStatistics) {
		super();
		this.id = id;
		this.experimentRun = experimentRun;
		this.experimentScenarioNo = experimentScenarioNo;
		this.parameterValueCombination = parameterValueCombination;
		this.outputStatistics = outputStatistics;
	}
	
	public static long getAutoId() {
		return new Date().getTime();
	}
}
