describe('policies.wizard.controller.policy-model-accordion-controller', function () {
  var ctrl, scope, translate, fakeTranslation, fakePolicy, fakePolicyTemplate, fakeModel, policyModelFactoryMock,
     modelFactoryMock, cubeServiceMock, ModelServiceMock, triggerServiceMock, wizardStatusServiceMock = null;

  beforeEach(module('webApp'));
  beforeEach(module('model/policy.json'));
  beforeEach(module('template/policy.json'));
  beforeEach(module('model/transformation.json'));

  beforeEach(inject(function ($controller, $q, $httpBackend, $rootScope) {
    scope = $rootScope.$new();
    fakeTranslation = "fake translation";
    translate = jasmine.createSpy().and.returnValue(fakeTranslation);

    inject(function (_modelPolicy_, _templatePolicy_, _modelTransformation_) {
      fakePolicy = angular.copy(_modelPolicy_);
      fakePolicyTemplate = _templatePolicy_;
      fakeModel = _modelTransformation_;
    });

    $httpBackend.when('GET', 'languages/en-US.json')
      .respond({});

    wizardStatusServiceMock =  jasmine.createSpyObj('WizardStatusService', ['enableNextStep']);

    policyModelFactoryMock = jasmine.createSpyObj('PolicyModelFactory', ['getCurrentPolicy', 'getTemplate', 'previousStep', 'nextStep', 'enableNextStep']);
    policyModelFactoryMock.getCurrentPolicy.and.callFake(function () {
      return fakePolicy;
    });

    policyModelFactoryMock.getTemplate.and.callFake(function () {
      return fakePolicyTemplate;
    });

    modelFactoryMock = jasmine.createSpyObj('ModelFactory', ['resetModel', 'getModel', 'setModel', 'isValidModel', 'updateModelInputs']);
    modelFactoryMock.getModel.and.returnValue(fakeModel);

    cubeServiceMock = jasmine.createSpyObj('CubeService', ['findCubesUsingOutputs']);

    ModelServiceMock = jasmine.createSpyObj('ModelService', ['isActiveModelCreationPanel', 'changeModelCreationPanelVisibility', 'getModelCreationStatus', 'activateModelCreationPanel', 'resetModel']);
    triggerServiceMock = jasmine.createSpyObj('TriggerService', ['setTriggerContainer', 'changeVisibilityOfHelpForSql', 'getTriggerCreationStatus', 'disableTriggerCreationPanel']);


    ctrl = $controller('PolicyModelAccordionCtrl  as vm', {
      'WizardStatusService': wizardStatusServiceMock,
      'PolicyModelFactory': policyModelFactoryMock,
      'ModelFactory': modelFactoryMock,
      'CubeService': cubeServiceMock,
      'ModelService': ModelServiceMock,
      '$translate': translate,
      'TriggerService': triggerServiceMock,
      '$scope': scope
    });

  }));

  describe("when it is initialized", function () {

    it('it should get a policy template from from policy factory', function () {
      expect(ctrl.template).toBe(fakePolicyTemplate);
    });

    it('it should get the policy that is being created or edited from policy factory', function () {
      expect(ctrl.policy).toBe(fakePolicy);
    });

    it('it should put as trigger container the attribute streamTriggers of policy', function () {
      expect(triggerServiceMock.setTriggerContainer).toHaveBeenCalledWith(ctrl.policy.streamTriggers, "transformation");
    });

  });

  describe("should be able to see changes in the accordion status to update the model of the model factory", function () {
    describe("if the new value of the accordion status is not null should find the model that has been opened by user, and send it to the model factory ", function () {
      var models, fakeModel2 = null;
      beforeEach(function () {
        fakeModel2 = angular.copy(fakeModel);
        fakeModel2.name = "fake model 2";
        fakeModel2.order = 1;
        models = [fakeModel, fakeModel2];
      });
      it("if position is between 0 and policy models length, the factory model is updated with the model of that position in the policy model array", function () {
        ctrl.policy.transformations = models;
        var position = 1;
        ctrl.modelAccordionStatus[position] = true;

        ctrl.changeOpenedModel(position);

        expect(modelFactoryMock.setModel).toHaveBeenCalledWith(fakeModel2, 1);
      });
      it("if position is not between 0 and policy models length, the factory model is reset with the order of the previous model", function () {
        var fakeModel2 = angular.copy(fakeModel);
        fakeModel2.name = "fake model 2";

        var models = [fakeModel, fakeModel2];
        ctrl.policy.transformations = models;
        var position = 2;
        ctrl.modelAccordionStatus[position] = true;

        ctrl.changeOpenedModel(position);

        expect(ModelServiceMock.resetModel).toHaveBeenCalledWith(fakePolicyTemplate);
      })
    })
  });

});

