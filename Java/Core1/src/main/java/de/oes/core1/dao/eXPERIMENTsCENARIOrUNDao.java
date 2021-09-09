package de.oes.core1.dao;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import de.oes.core1.entity.eXPERIMENTsCENARIOrUN;


@Repository
@Transactional
public class eXPERIMENTsCENARIOrUNDao {
	@PersistenceContext
	protected EntityManager entityManager;
	

	public void create(eXPERIMENTsCENARIOrUN e) {
		entityManager.persist(e);
	}
	
	public void merge(eXPERIMENTsCENARIOrUN e) {
		entityManager.merge(e);
	}
	
	public eXPERIMENTsCENARIOrUN update(eXPERIMENTsCENARIOrUN e) {
		return entityManager.merge(e);
	}
	
	public String getEntityName(Class<?> otherEntityClazz) {
		String simpleName = otherEntityClazz.getSimpleName();
		return simpleName;
	}
	
	public List<eXPERIMENTsCENARIOrUN> findAll() {
		return entityManager.createQuery("select e from " + eXPERIMENTsCENARIOrUN.class.getName() + " e", eXPERIMENTsCENARIOrUN.class).getResultList();
	}
}
