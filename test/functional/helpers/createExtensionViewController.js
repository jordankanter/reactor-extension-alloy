/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t } from "testcafe";

const getSettings = async () => {
  await t.switchToMainWindow();
  return t.eval(() => {
    return window.loadExtensionViewPromise.then(extensionView => {
      return extensionView.getSettings();
    });
  });
};

const validate = async () => {
  await t.switchToMainWindow();
  return t.eval(() => {
    return window.loadExtensionViewPromise.then(extensionView => {
      return extensionView.validate();
    });
  });
};

module.exports = viewPath => {
  // window.loadExtensionView is provided by the extension sandbox tool.
  // More details about the tool and this method can be found here:
  // https://www.npmjs.com/package/@adobe/reactor-sandbox
  return {
    async init(initInfo = {}, sharedViewMethods = {}) {
      await t.switchToMainWindow();
      return t.eval(
        () => {
          window.loadExtensionViewPromise = window.loadExtensionView({
            viewPath,
            initInfo,
            // Can't use spread operator or Object.assign due to
            // what appears to be weirdness between babel and t.eval()
            openCodeEditor: sharedViewMethods.openCodeEditor,
            openRegexTester: sharedViewMethods.openRegexTester,
            openDataElementSelector: sharedViewMethods.openDataElementSelector
          });
        },
        {
          dependencies: {
            viewPath,
            initInfo,
            sharedViewMethods
          }
        }
      );
    },
    async expectIsValid() {
      const valid = await validate();
      await t
        .expect(valid)
        .ok("Expected settings to be valid when they were not valid");
    },
    async expectIsNotValid() {
      const valid = await validate();
      await t
        .expect(valid)
        .notOk("Expected settings to not be valid when they were valid");
    },
    async expectSettings(expectedSettings) {
      const actualSettings = await getSettings();

      await t
        .expect(actualSettings)
        .eql(
          expectedSettings,
          `Expected settings: ${JSON.stringify(
            expectedSettings
          )} Actual settings: ${JSON.stringify(actualSettings)}`
        );
    }
  };
};
