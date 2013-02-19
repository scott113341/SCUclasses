var js_core_all = [
    {name:'default', fullname:'Choose a core requirement'},
    {name:'I_AW', fullname:'Advanced Writing'},
    {name:'E_ARTS', fullname:'Arts'},
    {name:'E_CEPAR', fullname:'Civic Engagement Partial Credit'},
    {name:'E_CE', fullname:'Civic Engagement'},
    {name:'F_CTW1', fullname:'Critical Thinking & Writing 1'},
    {name:'F_CTW2', fullname:'Critical Thinking & Writing 2'},
    {name:'F_CI1', fullname:'Cultures & Ideas 1'},
    {name:'F_CI2', fullname:'Cultures & Ideas 2'},
    {name:'E_CI3', fullname:'Cultures & Ideas 3'},
    {name:'E_DV', fullname:'Diversity'},
    {name:'E_ETH', fullname:'Ethics'},
    {name:'I_EL', fullname:'Experiential Learning for Social Justice'},
    {name:'MULTIFS', fullname:'Fall & Spring'},
    {name:'MULTIFW', fullname:'Fall & Winter'},
    {name:'LAB', fullname:'Lab Section'},
    {name:'F_MATH', fullname:'Mathematics'},
    {name:'E_NTSC', fullname:'Natural Science'},
    {name:'E_STSPAR', fullname:'Partial Credit, Engr, Math, CS'},
    {name:'I_PTHAMS', fullname:'Pathway - American Studies'},
    {name:'I_PTHAE', fullname:'Pathway - Applied Ethics'},
    {name:'I_PTHB', fullname:'Pathway - Beauty'},
    {name:'I_PTHCHD', fullname:'Pathway - Childhood, Family & Society'},
    {name:'I_PTHCINST', fullname:'Pathway - Cinema Studies'},
    {name:'I_PTHDEM', fullname:'Pathway - Democracy'},
    {name:'I_PTHDT', fullname:'Pathway - Design Thinking'},
    {name:'I_PTHFHP', fullname:'Pathway - Food, Hunger, Poverty Environment'},
    {name:'I_PTHGSB', fullname:'Pathway - Gender, Sexuality & the Body'},
    {name:'I_PTHGH', fullname:'Pathway - Global Health'},
    {name:'I_PTHHR', fullname:'Pathway - Human Rights'},
    {name:'I_PTHIS', fullname:'Pathway - Islamic Studies'},
    {name:'I_PTHJA', fullname:'Pathway - Justice & the Arts'},
    {name:'I_PTHLSJ', fullname:'Pathway - Law & Social Justice'},
    {name:'I_PTHLPOSC', fullname:'Pathway - Leading People, Organizations & Social Change'},
    {name:'I_PTHPS', fullname:'Pathway - Paradigm Shifts'},
    {name:'I_PTHPR', fullname:'Pathway - Politics & Religion'},
    {name:'I_PTHPP', fullname:'Pathway - Public Policy'},
    {name:'I_PTHRPSI', fullname:'Pathway - Race, Place & Social Inequities'},
    {name:'I_PTHS', fullname:'Pathway - Sustainability'},
    {name:'I_PTHDA', fullname:'Pathway - The Digital Age'},
    {name:'I_PTHVST', fullname:'Pathway - Values in Science & Technology'},
    {name:'I_PTHV', fullname:'Pathway - Vocation'},
    {name:'F_RTC1', fullname:'Religion, Theology & Culture 1'},
    {name:'E_RTC2', fullname:'Religion, Theology & Culture 2'},
    {name:'E_RTC3', fullname:'Religion, Theology & Culture 3'},
    {name:'E_STS', fullname:'Science, Technology & Society'},
    {name:'F_SLA2', fullname:'Second Language, BA, BS, Soc Sci'},
    {name:'F_SLA1', fullname:'Second Language, BSC, BS Sci/Math'},
    {name:'E_SOSC', fullname:'Social Science'},
    {name:'MULTIWS', fullname:'Winter & Spring'}
];





$(function() {
    window.js_core = _.filter(js_core_all, function(core) {
        var remove = [
            'LAB',
            'MULTIFS',
            'MULTIFW',
            'MULTIWS'
        ];

        if (_.contains(remove, core.name)) return false;
        else return true;
    });
});
