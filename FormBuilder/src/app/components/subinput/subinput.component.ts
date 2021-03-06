import { Component, OnInit, ViewContainerRef, ViewChild, Input } from '@angular/core';
import { FormControl, FormArray } from '@angular/forms';
import { CONDITIONTYPES, INPUTTYPES, BOOLANSWERS } from '../../consts';
import { ComponentService } from 'src/app/services/component.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-subinput',
  templateUrl: './subinput.component.html',
  styleUrls: ['./subinput.component.scss']
})
export class SubinputComponent implements OnInit {

  @ViewChild('subViewContainerRef', { read: ViewContainerRef }) viewContainerReference: ViewContainerRef;
  @Input() inputData: any;

  public answer: FormControl = new FormControl('', []);
  public condition: FormControl = new FormControl('', []);
  public inputType: FormControl = new FormControl('', []);
  public question: FormControl = new FormControl('', []);

  public boolAnswers = Object.values(BOOLANSWERS);
  public conditionTypes = Object.values(CONDITIONTYPES);
  public inputTypes = Object.values(INPUTTYPES);
  
  private childComponentsToSave: any[] = [];
  private componentsReferences: any[] = [];

  constructor(private componentService: ComponentService, private validationService: ValidationService) { }

  ngOnInit() {
    this.componentService.parentInputType.subscribe(event => this.checkIndexes(event.type, event.childrensComponentsIndexes));
    this.componentService.childIndex.subscribe(event => this.deleteChildComponent(event));
    this.childComponentsToSave.length = 0;
    this.answer.setValue(this.inputData.answer);
    this.question.setValue(this.inputData.question);
    this.inputType.setValue(this.inputData.inputType);
    this.condition.setValue(this.inputData.condition);
    if (this.inputData.components) {
      this.generateComponents();
    }
    this.checkIndexes(this.inputData.parentInputType);
    console.log(this.inputData.answer)
    console.log(this.answer.value)
    console.log(this.condition.value)
    console.log(this.question.value)
  }
  
  addComponent() {
    this.componentsReferences = this.componentService.addComponent('SubinputComponent', this.viewContainerReference, this.componentsReferences, {parentInputType: this.inputType.value});
  }

  deleteSelf() {
    this.componentService.deleteComponent(this.inputData.selfIndex)
  }

  deleteChildComponent(index: number) {
    let componentReference = this.componentsReferences.filter(x => x.instance.inputData.selfIndex === index)[0];
    if(componentReference) {
    this.viewContainerReference.remove(this.viewContainerReference.indexOf(componentReference));
    this.componentsReferences = this.componentsReferences.filter(x => x.instance.inputData.selfIndex !== index);
    }
  }

  generateComponents() {
    for (let i = 0; i < this.inputData.components.length; i++) {
      this.inputData.components[i] = {...this.inputData.components[i], ...{parentInputType: this.inputData.inputType}};
    };
    this.componentsReferences = this.componentService.generateComponents('SubinputComponent', this.viewContainerReference, this.componentsReferences, this.inputData.components);
  }
  
  setData() {
    for (let i = 0; i < this.componentsReferences.length; i++) {
      this.childComponentsToSave.push(this.componentsReferences[i].instance.setData());
    }
    return {
      index: this.inputData.selfIndex, question: this.question.value, answer: this.answer.value,
      inputType: this.inputType.value, condition: this.condition.value, components: this.childComponentsToSave
    };
  }

  setConditionTypes(type: string) {
    
    if (this.inputData.parentInputType !== type)
     this.answer.setValue('');
    this.inputData.parentInputType = type;
    if (type === 'Text' || type === 'Yes/No') 
    this.conditionTypes = this.conditionTypes.slice(0, 1);
  else
    this.conditionTypes = Object.values(CONDITIONTYPES);
  }

  checkIndexes(type: string, indexes?: []) {
    if (indexes) {
      indexes.forEach(element => {
        if (element === this.inputData.selfIndex) 
          this.setConditionTypes(type);
      });
    }
    else {
      this.setConditionTypes(type);
    }
  }

  checkValidation() {
    this.inputType.valueChanges.subscribe(event => this.componentService.setParentInputType(event, this.componentsReferences));
    return this.validationService.checkValidation(new FormArray(
      new Array<FormControl>(this.question, this.inputType, this.answer, this.condition)
    ));
  }

}
