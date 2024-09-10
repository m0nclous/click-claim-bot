import { type Context, Scenes } from 'telegraf';

interface ILoginWizardSessionProps extends Scenes.WizardSessionData {
    without_pass: boolean;
}

export interface LoginWizardContext extends Context {
    scene: Scenes.SceneContextScene<LoginWizardContext, ILoginWizardSessionProps>;
    wizard: Scenes.WizardContextWizard<LoginWizardContext>;
}
