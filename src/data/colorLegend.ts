import { MEDICAL_COLORS } from '../utils/types';

export interface ColorMeaning {
    name: string;
    color: string;
    meanings: string[];
}

export const COLOR_LEGEND: Record<string, ColorMeaning> = {
    [MEDICAL_COLORS.red]: {
        name: 'Red',
        color: MEDICAL_COLORS.red,
        meanings: [
            'Hemorrhages (preretinal and intraretinal)',
            'Attached retina',
            'Retinal arterioles',
            'Neovascularization',
            'Vascular abnormalities/anomalies',
            'Vascular tumors',
            'Open interior of conventional retinal breaks (tears, holes)',
            'Open interior of outer layer holes in retinoschisis',
            'Open portion of retinal holes in the inner layer of retinoschisis',
            'Open portion of Giant retinal tear (GRT) or large dialyses',
            'Inner portion of thin areas of retina',
            'Elevated neovascularization',
            'Subhyaloid hemorrhage',
            'Macular edema'
        ]
    },
    [MEDICAL_COLORS.blue]: {
        name: 'Blue',
        color: MEDICAL_COLORS.blue,
        meanings: [
            'Detached retina',
            'Retinal veins',
            'Outlines of retinal breaks',
            'Inner layer of retinoschisis',
            'Outline of lattice degeneration (inner "x")',
            'Outline of thin areas of retina',
            'Outlines of ora serrata',
            'Outline of change in area or folds of detached retina because of shifting fluid',
            'Detached pars plana epithelium anterior to the separation of ora serrate',
            'White with or without pressure',
            'Rolled edges of retinal tears (curved lines)',
            'Cystoid degeneration',
            'Outline of flat neovascularization'
        ]
    },
    [MEDICAL_COLORS.green]: {
        name: 'Green',
        color: MEDICAL_COLORS.green,
        meanings: [
            'Opacities in the media',
            'Vitreous hemorrhage',
            'Vitreous membranes',
            'Hyaloid ring',
            'Intraocular foreign body (IOFB)',
            'Asteroid hyalosis',
            'Frosting or snowflakes on cystoid degenerations',
            'Retinoschisis or lattice degeneration',
            'Outline of elevated Neovascularization'
        ]
    },
    [MEDICAL_COLORS.brown]: {
        name: 'Brown',
        color: MEDICAL_COLORS.brown,
        meanings: [
            'Uveal tissue',
            'Pigment beneath detached retina',
            'Pigment epithelial detachment',
            'Malignant choroidal melanomas',
            'Choroidal detachment',
            'Outline of posterior staphyloma'
        ]
    },
    [MEDICAL_COLORS.yellow]: {
        name: 'Yellow',
        color: MEDICAL_COLORS.yellow,
        meanings: [
            'Intraretinal subretinal hard yellow exudate',
            'Deposits in the retinal pigment epithelium',
            'Post cryo/laser retinal edema',
            'Drusen',
            'Venous sheathing'
        ]
    },
    [MEDICAL_COLORS.black]: {
        name: 'Black',
        color: MEDICAL_COLORS.black,
        meanings: [
            'Hyperpigmentation as a result of previous t/t with cryo/diathermy',
            'Sclerosed vessels',
            'Pigment in detached retina',
            'Pigmented demarcation lines at the attached margin of detached retina or within detached retina'
        ]
    }
};

export const getColorContextForAI = (): string => {
    let context = "Here is the legend for the colors used in the fundus drawing. Use this to interpret the features in the image:\n\n";

    Object.values(COLOR_LEGEND).forEach(item => {
        context += `${item.name.toUpperCase()}:\n`;
        item.meanings.forEach(meaning => {
            context += `- ${meaning}\n`;
        });
        context += "\n";
    });

    return context;
};
