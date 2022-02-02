/*******************************************************************************
 * This library file contains the elements of the OES Agents package
 * @copyright Copyright 2022 Gerd Wagner, BTU (Germany)
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

/******************************************************************************
 *** Agents Package ***********************************************************
 ******************************************************************************/
/**
 * Agents are objects that are able to receive messages sent by other agents
 * and perceive their environment (its objects and events).
 */
class aGENT extends oBJECT {
  constructor({id, name, hasPerfectInformation=true, objects, contacts}) {
    super( id, name);
    this.hasPerfectInformation = hasPerfectInformation;
    // a map of references to the objects that the agent knows
    if (objects) this.objects = objects;
    // a map of references to the agents that form the agent's contacts
    if (contacts) this.contacts = contacts;
    // add each new agent to the Map of simulation agents
    sim.agents.set( this.id, this);
  }
  // receive a generic Tell message with a triple statement
  /*
  onReceiveTell(statement, sender) {
    if (sender.hasPerfectInformation) {
      this.objects[statement.objId][statement.propName] = statement.value;
    }
  }
  */
  // overwrite/improve the standard toString method
  /*
  toString() {
    return "agt-"+ (this.name||this.id);
  }
  */
}
/**
 * Reinforcement learning agents have a learned decision function and two
 * training methods: learnSuccess and learnFailure
 */
class rEINFORCEMENTlEARNINGaGENT extends aGENT {
  constructor({id, name, hasPerfectInformation=true, objects, contacts, learnFunction}) {
    super({id, name, hasPerfectInformation, objects, contacts});
    this.learnFunction = learnFunction;
    this.currentStateTypeNo = 0;  // the state type number of the current RL action choice
    this.chosenActionNo = 0;  // the action number of the current RL action choice
  }
  // update the RL decision function in the case of success
  learnSuccess() {
    if (this.currentStateTypeNo && this.chosenActionNo) {
      this.learnFunction.learnSuccess( this.currentStateTypeNo, this.chosenActionNo);
      //console.log("Success "+ this.learnFunction.toString());
    }
  }
  // update the RL decision function in the case of failure
  learnFailure() {
    if (this.currentStateTypeNo && this.chosenActionNo) {
      this.learnFunction.learnFailure( this.currentStateTypeNo, this.chosenActionNo);
      //console.log("Failure "+ this.learnFunction.toString());
    }
  }
}

/**
 * Perception events are processed by the simulator by invoking the perceiver's
 * perceive method.
 */
class pERCEPTIONeVENT extends eVENT {
  constructor({occTime, delay, percept, perceiver}) {
    super({occTime, delay});
    if (percept) this.percept = percept;  // string or expression (JS object)
    // id or object reference
    this.perceiver = typeof perceiver === "object" ? perceiver : sim.objects[perceiver];
  }
  onEvent() {
    this.perceiver.onPerceive( this.percept);
    return [];
  }
}
pERCEPTIONeVENT.labels = {"percept":"perc"};

/**
 * Action events are processed by the simulator by invoking the perceiver's
 * perceive method.
 */
class aCTION extends eVENT {
  constructor({occTime, delay, performer, action}) {
    super({occTime, delay});
    // id or object reference
    this.performer = typeof performer === "object" ? performer : sim.objects[performer];
    if (action) this.action = action;  // string or expression (JS object)
  }
  onEvent() {
    this.performer.perform( this.action);
    return [];
  }
}
aCTION.labels = {"action":"act"};

/**
 * Abstract class to be extended by reinforcement learning action event classes
 * that define (a) the properties "success" and possibly "othersToBeRewarded",
 * and (b) an onEvent method invoking the problem-independent onEvent method
 * of the abstract superclass and taking care of performing the problem-specific
 * action.
 */
class rEINFORCEMENTlEARNINGaCTION extends aCTION {
  constructor({occTime, delay, performer, success, othersToBeRewarded=[]}) {
    super({occTime, delay, performer});
    this.success = success;  // Boolean
    this.othersToBeRewarded = othersToBeRewarded;
  }
  onEvent() {
    if (this.success) {
      this.performer.learnSuccess();
      for (const agt of this.othersToBeRewarded) {
        agt.learnSuccess();
      }
    } else {
      this.performer.learnFailure();
      for (const agt of this.othersToBeRewarded) {
        agt.learnFailure();
      }
    }
    return [];
  }
}
/**
 * Perception events are processed by the simulator by invoking the perceiver's
 * perceive method.
 */
class mESSAGEeVENT extends eVENT {
  constructor({occTime, delay, message, sender, receiver}) {
    super({occTime, delay});
    if (message) this.message = message;  // string or expression (JS object)
    // id or object reference
    this.sender = typeof this.sender === "string" ?
        sim.objects[this.sender] : sender;
    this.receiver = typeof this.receiver === "string" ?
        sim.objects[this.receiver] : receiver;
  }
  onEvent() {
    this.receiver.receive( this.message, this.sender);
    return [];
  }
}
mESSAGEeVENT.labels = {"message":"msg"};

/**
 * Time events are processed by the simulator by invoking the onTimeEvent method
 * of all agents.
 */
class tIMEeVENT extends eVENT {
  constructor({occTime, delay, type}) {
    super({occTime, delay});
    this.type = type;  // string
  }
  onEvent() {
    for (const agt of sim.agents.values()) {
      agt.onTimeEvent( this);
    }
    return [];
  }
}
