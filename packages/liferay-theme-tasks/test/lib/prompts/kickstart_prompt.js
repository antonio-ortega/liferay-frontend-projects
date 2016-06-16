'use strict';

var _ = require('lodash');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');
var test = require('ava');

var testUtil = require('../../util');

var GlobalModulePrompt;
var KickstartPrompt;
var NPMModulePrompt;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'kickstart_prompt'
	}, function(config) {
		GlobalModulePrompt = require('../../../lib/prompts/global_module_prompt.js');
		KickstartPrompt = require('../../../lib/prompts/kickstart_prompt.js');
		NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt.js');

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'kickstart_prompt');
});

var prototype;

test.beforeEach(function() {
	prototype = _.create(KickstartPrompt.prototype);
});

test('constructor should pass arguments to init', function(t) {
	var init = KickstartPrompt.prototype.init;

	KickstartPrompt.prototype.init = sinon.spy();

	new KickstartPrompt(_.noop);

	t.true(KickstartPrompt.prototype.init.calledWith(_.noop));

	KickstartPrompt.prototype.init = init;
});

test('init should should assign callback as done property, set themeConfig, and invoke prompting', function(t) {
	prototype._promptThemeSource = sinon.spy();

	var themeConfig = {
		version: '7.0'
	};

	prototype.init({
		themeConfig: themeConfig
	}, _.noop);

	t.true(prototype._promptThemeSource.calledOnce);
	t.deepEqual(prototype.themeConfig, themeConfig);
	t.is(prototype.done, _.noop);
});

test('_afterPromptModule should pass answers to done prop or invoke _installTempModule', function(t) {
	var answers = {
		modules: {
			'some-theme': {}
		}
	};

	prototype._installTempModule = sinon.spy();
	prototype.done = sinon.spy();

	prototype._afterPromptModule(answers);

	t.true(prototype._installTempModule.notCalled);
	t.true(prototype.done.calledWith(answers));

	answers.module = 'some-theme';

	prototype._afterPromptModule(answers);

	t.true(prototype._installTempModule.calledWith('some-theme'));

	prototype._installTempModule.getCall(0).args[1]();

	t.true(prototype.done.getCall(1).calledWith(answers));
});

test('_afterPromptModule should set modulePath property of answers object if realPath exists in pkg', function(t) {
	var answers = {
		module: 'some-theme',
		modules: {
			'some-theme': {
				realPath: '/path/to/some-theme'
			}
		}
	};

	prototype._installTempModule = sinon.spy();
	prototype.done = sinon.spy();

	prototype._afterPromptModule(answers);

	t.true(prototype._installTempModule.notCalled);
	t.true(prototype.done.calledWith(answers));
	t.is(answers.modulePath, path.join('/path/to/some-theme/src'));
});

test('_afterPromptThemeSource should invoke correct prompt based on themeSource answer passing _afterPromptModule as callback', function(t) {
	var init = NPMModulePrompt.prototype.init;

	NPMModulePrompt.prototype.init = sinon.spy();

	var answers = {
		themeSource: 'npm'
	};

	prototype._afterPromptThemeSource(answers);

	t.true(NPMModulePrompt.prototype.init.calledOnce);

	NPMModulePrompt.prototype.init = init;

	init = GlobalModulePrompt.prototype.init;

	GlobalModulePrompt.prototype.init = sinon.spy();

	answers.themeSource = 'global';

	prototype._afterPromptThemeSource(answers);

	t.true(GlobalModulePrompt.prototype.init.calledOnce);

	GlobalModulePrompt.prototype.init = init;
});

test.cb('_installTempModule should pass', function(t) {
	var name = 'a-theme-name-that-should-never-exist';

	prototype._installTempModule(name, function(err) {
		var command = 'npm install --prefix ' + path.join(process.cwd(), '.temp_node_modules') + ' ' + name;

		if (err.cmd) {
			t.true(err.cmd.indexOf(command) > -1);
		}

		t.end();
	});
});

test('_promptThemeSource should pass', function(t) {
	var prompt = inquirer.prompt;

	inquirer.prompt = sinon.spy();
	prototype._afterPromptThemeSource = sinon.spy();

	prototype._promptThemeSource();

	var args = inquirer.prompt.getCall(0).args;

	t.is(args[0][0].name, 'themeSource');

	args[1]('arguments');

	t.true(prototype._afterPromptThemeSource.calledWith('arguments'));

	inquirer.prompt = prompt;
});
