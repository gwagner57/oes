package de.oes.core1.entity;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import de.oes.core1.sim.eXPERIMENTtYPE;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "exprun")
public class eXPERIMENTrUN implements Serializable{
	private static final long serialVersionUID = 6464037290003245081L;
	public static final String ID = "id";
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name="id")
	private long id;
	
	@Transient
	private eXPERIMENTtYPE experimentType;
	
	@NotNull(message = "eXPERIMENTrUN.baseScenarioNo:NotNull")
	private Long baseScenarioNo;
	
	@NotNull(message = "eXPERIMENTrUN.dateTime:NotNull")
	private Date dateTime;
	
	public eXPERIMENTrUN(long id, eXPERIMENTtYPE experimentType, long baseScenarioNo, Date dateTime) {
		super();
		this.id = id;
		this.experimentType = experimentType;
		this.baseScenarioNo = baseScenarioNo;
		this.dateTime = dateTime;
	}
	
	public static long getAutoId() {
		return new Date().getTime();
	}
	
}
