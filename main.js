/*globals define, console*/

define(function (require, exports, module) {
    'use strict';

    var ExtensionUtils  = brackets.getModule('utils/ExtensionUtils'),
        LiveDevelopment = brackets.getModule('LiveDevelopment/LiveDevelopment'),
        Inspector       = brackets.getModule('LiveDevelopment/Inspector/Inspector'),
        AppInit         = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        ProjectManager  = brackets.getModule('project/ProjectManager'),
        UI = require('src/UI'),
        WidgetManager = require('src/WidgetManager'),
        TracerManager = require('src/TracerManager');

    var WebInspector = require('thirdparty/WebInspector');

    function testInspector() {

        window.RuntimeAgent = Inspector.Runtime;
        // RuntimeAgent.getProperties = function(res) {
        //     return Inspector.Runtime.getProperties(arguments[0], arguments[1], function(res) {
        //         arguments[3].call(this, res.result, res.internalProperties);
        //     });
        // }


        // var _printResult = function(result, wasThrown, originatingCommand)
        // {
        //     console.log('result', result);
        //     if (!result)
        //         return;

        //     var message = new WebInspector.ConsoleCommandResult(result, wasThrown, originatingCommand, WebInspector.Linkifier, undefined, undefined, undefined);
        //     console.log('message', message);
        //     console.log('toMessageElement', message.toMessageElement());
        //     $('#project-files-container').append(message.toMessageElement());
        //         // WebInspector.console.addMessage(message);

        // };

        Inspector.Runtime.evaluate('window', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
            // res = {result, wasThrown}

            console.log('evaluated', arguments);
            console.log('RemoteObject', WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, 'window');

            Inspector.Runtime.getProperties(res.result.objectId, function(result, internalProperties) {
                console.log('getProperties', arguments);
            });
        });
        // Inspector.Runtime.evaluate('1+1', 'console', false, false, undefined, undefined, undefined, true /* generate preview */, function (res) {
        //     _printResult(WebInspector.RemoteObject.fromPayload(res.result), !!res.wasThrown, '1+1');
        // });

    }


    ExtensionUtils.loadStyleSheet(module, 'main.less');
    ExtensionUtils.loadStyleSheet(module, 'src/styles/font-awesome.css');

    ExtensionUtils.loadStyleSheet(module, 'thirdparty/styles/inspector.css');

    var hostEditor;


    var inlineWidgets = {};



    // Update statusbar
    $(LiveDevelopment).on('statusChange', function(e, status) {
        UI.statusIndicator.updateStatus(status);
    });



    var _loggedNodes = [], _loggedEventNames = [], _loggingExceptions = false, _loggingConsoleLogs = false;
    var _logHandle;


    // Insert tracer into browser
    $(LiveDevelopment).on('statusChange', function(e, status) {
        if (status === 3) {
            TracerManager.disconnectAll();
            TracerManager.connectAll();
            testInspector();
        }
        if (status === 0) {
            TracerManager.disconnectAll();
        }
    });




    function _init() {

        hostEditor = EditorManager.getCurrentFullEditor();

        // var $bookmark = $('<div />').css('background', '#11f').html('bookmark');
        // var testBookmark = hostEditor._codeMirror.addWidget({line: 8, ch: 14}, $bookmark.get(0));


        // UI.panel()

        DocumentManager.getWorkingSet().forEach(function(file) {
            TracerManager.registerFile(file);
        });

        $(DocumentManager).on('documentSaved', function(e, doc) {
            TracerManager.registerFile(doc.file);
        });

        $(DocumentManager).on('documentRefreshed', function(e, doc) {
            TracerManager.registerFile(doc.file);
        });

        $(DocumentManager).on('workingSetAdd', function(e, file) {
            TracerManager.registerFile(file);
        });

        $(DocumentManager).on('workingSetAddList', function(e, list) {
            list.forEach(function(file) {
                TracerManager.registerFile(file);
            });
        });

        $(DocumentManager).on('workingSetRemove', function(e, file) {
            TracerManager.unregisterFile(file);
        });

        $(DocumentManager).on('workingSetRemoveList', function(e, list) {
            list.forEach(function(file) {
                TracerManager.unregisterFile(file);
            });
        });

        $(DocumentManager).on('fileNameChanged', function(e, oldName, newName) {
            console.log(arguments);
            // TODO
            // TracerManager.unregisterFile(file);
        });

        TracerManager.listen();


    }


    AppInit.appReady(_init);


});