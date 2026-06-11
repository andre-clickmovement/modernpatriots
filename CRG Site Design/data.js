// Content data for the Conservative Research Group prototype.
// Headlines are drawn from the live site; bodies are representative editorial copy.
window.CRG_DATA = (function () {
  const P = (s) => s; // paragraph helper (identity, for readability)

  const articles = [
    {
      id: "rachael-gunn-retirement",
      cat: "News",
      kicker: "Olympics",
      title: "Controversial Australian Olympic Breaker Rachael Gunn Announces Shocking Retirement",
      author: "Conservative Research Group",
      date: "November 7, 2024",
      readMins: 4,
      img: "RACHAEL GUNN \u00b7 PARIS 2024",
      dek: "The 37-year-old academic, mocked online for an unconventional Olympic routine, says she will step away from competition within months.",
      body: [
        "Rachael Gunn, a breaker from Australia, told a Sydney radio station that she plans to retire within three months. Some ridiculed her for her unconventional routine at the Paris Olympics, and conspiracy theories circulated about how she qualified for the Games at all.",
        "The 37-year-old Sydney University lecturer failed to score in all three of her round-robin battles, drawing a wave of commentary across social media that followed her home from France.",
        "\u201cI didn\u2019t expect that the response would be so wild,\u201d Gunn said in the interview. \u201cIt has been really upsetting. I think the most heartbreaking part is the way it impacted my community.\u201d",
        "Breaking made its Olympic debut in Paris and is not currently scheduled to appear at the 2028 Los Angeles Games. Supporters argued that Gunn\u2019s qualification was legitimate under the sport\u2019s governing rules, and that the volume of mockery said more about online culture than about the athlete.",
        "Gunn said she remains committed to the broader breaking community in Australia even as she steps back from elite competition, and she thanked the people who had defended her in recent months."
      ]
    },
    {
      id: "mexico-highway-bodies",
      cat: "News",
      kicker: "World",
      title: "Horrifying Discovery: Police in Mexico Find 11 Bodies, Including 2 Minors, Abandoned by Highway",
      author: "Conservative Research Group",
      date: "November 7, 2024",
      readMins: 3,
      img: "GUERRERO STATE \u00b7 MEXICO",
      dek: "Prosecutors say the bodies were discovered in a region long torn by cartel violence after a late-night tip about an abandoned truck.",
      body: [
        "Prosecutors in Guerrero state said that 11 bodies were found by a highway in southern Mexico, in an area rife with drug cartel violence. Two of the bodies were minors.",
        "Police received a tip late Wednesday night about an abandoned pickup truck in the city of Chilpancingo, the state capital. Two rival drug cartels have been fighting for control of the region for years.",
        "Authorities did not immediately release the identities of the victims and said an investigation was ongoing. The discovery is the latest in a string of mass killings that have strained local law enforcement.",
        "Security analysts say the violence reflects a broader breakdown of order in parts of the country, where local police are frequently outgunned and intimidated by organized crime."
      ]
    },
    {
      id: "trump-supporters-hymn",
      cat: "News",
      kicker: "Election",
      title: "Trump Supporters Sing \u2018How Great Thou Art\u2019 in Emotional Celebration After Election Victory",
      author: "Conservative Research Group",
      date: "November 6, 2024",
      readMins: 3,
      img: "VICTORY CELEBRATION \u00b7 FLORIDA",
      dek: "A spontaneous hymn swept through the crowd as supporters gathered to mark the President-elect\u2019s win.",
      body: [
        "After Donald Trump\u2019s historic election victory, supporters of the President-elect sang \u201cHow Great Thou Art\u201d together in celebration.",
        "The Truth with Lisa Boothe host Lisa Boothe said that witnessing the crowd singing the hymn in unison as she left the victory celebration moved her to tears. She shared a video on social media.",
        "\u201cThese people have been degraded and slandered, and yet here they are, singing,\u201d Boothe wrote alongside the clip, which spread quickly online.",
        "The moment captured the emotional intensity of an election night that many of the President-elect\u2019s supporters had described as a long shot only weeks earlier."
      ]
    },
    {
      id: "harris-chair-email",
      cat: "News",
      kicker: "Election",
      title: "Harris Campaign Chair\u2019s Heartbreaking Email to Staff Feels Like a Farewell",
      author: "Conservative Research Group",
      date: "November 6, 2024",
      readMins: 4,
      img: "CAMPAIGN HQ \u00b7 WILMINGTON",
      dek: "A memo to staff described the candidate\u2019s call conceding the race and thanked the team for an exhausting sprint.",
      body: [
        "Jen O\u2019Malley Dillon, the campaign manager for Kamala Harris, sent a memo to staff informing them that the Vice President had spoken with Donald Trump and accepted the results of the election.",
        "Washington Post reporter Tyler Pager obtained the memo, which was filled with the emotion of someone closing out a months-long effort.",
        "The note thanked staff and volunteers for their work and acknowledged the disappointment many were feeling in the hours after the race was called.",
        "Campaign veterans said such farewell memos are a tradition at the end of a national campaign, win or lose, and serve as a formal close to an intense period of work."
      ]
    },
    {
      id: "sf-mayor-ethics-fine",
      cat: "News",
      kicker: "Politics",
      title: "San Francisco Mayoral Candidate Hit with $108K Ethics Fine Just Before Election",
      author: "Conservative Research Group",
      date: "November 6, 2024",
      readMins: 3,
      img: "CITY HALL \u00b7 SAN FRANCISCO",
      dek: "An ethics commission investigation found the former mayor funded efforts in violation of city rules.",
      body: [
        "The San Francisco Chronicle reported the fine first, just one day before the election on Nov. 5. A former mayoral candidate, who once held the office, was fined more than $100,000 for an ethics violation.",
        "An investigation by the City and County of San Francisco Ethics Commission revealed that venture capitalist and former Mayor Mark Farrell funded efforts that ran afoul of the city\u2019s campaign finance rules.",
        "The timing of the announcement, on the eve of the vote, drew attention from both supporters and critics of the candidate.",
        "Ethics officials said the penalty reflected the scale of the violations and was intended to deter similar conduct in future races."
      ]
    },
    {
      id: "missouri-poll-worker-flood",
      cat: "News",
      kicker: "Weather",
      title: "Missouri Tragedy: Poll Worker Couple Dies After Car Swept Away in Floodwaters",
      author: "Conservative Research Group",
      date: "November 6, 2024",
      readMins: 3,
      img: "BEAVER CREEK \u00b7 MISSOURI",
      dek: "The state highway patrol says three vehicles were swept off the road in the pre-dawn hours of Election Day.",
      body: [
        "According to the state highway patrol, a couple working together at the polls in Missouri on Election Day died after their vehicle was overtaken by flash floodwaters.",
        "In a release posted on X, the Missouri State Highway Patrol stated that the incident took place around 4:30 a.m. Tuesday. Three vehicles were swept off the road when floodwaters from Beaver Creek rose suddenly.",
        "Local officials urged residents to avoid flooded roadways and warned that water depth and current can be deceptively dangerous, especially in darkness.",
        "The couple had reportedly volunteered at their precinct for several election cycles."
      ]
    },
    {
      id: "harris-pa-warning",
      cat: "News",
      kicker: "Election",
      title: "Harris Team Issues Ominous Warning on PA Election Results, Sparking Intense Speculation",
      author: "Conservative Research Group",
      date: "November 4, 2024",
      readMins: 4,
      img: "BATTLEGROUND \u00b7 PENNSYLVANIA",
      dek: "With the race razor-thin in the polls, both campaigns set expectations for a long count in the keystone state.",
      body: [
        "Donald Trump held a slight lead going into Election Day, both in RealClearPolitics\u2019 average of battleground-state polling \u2014 0.9 percent \u2014 and in the overall national vote at 0.3 percent.",
        "Campaign officials cautioned supporters that results from Pennsylvania could take time to finalize, citing the volume of mail ballots and the state\u2019s counting procedures.",
        "Analysts noted that early returns can shift substantially as different categories of votes are tabulated, and urged caution in reading too much into partial counts.",
        "Both campaigns deployed legal teams to the state in anticipation of a close finish."
      ]
    },
    {
      id: "musk-rogan-warning",
      cat: "News",
      kicker: "Media",
      title: "Elon Musk Drops Bombshell on Joe Rogan: Stark Warning About a Kamala Harris Victory",
      author: "Conservative Research Group",
      date: "November 4, 2024",
      readMins: 5,
      img: "PODCAST STUDIO \u00b7 AUSTIN",
      dek: "In a wide-ranging conversation, the billionaire laid out his case to the show\u2019s vast audience.",
      body: [
        "Elon Musk has become the target of the kind of intense criticism that Donald Trump usually receives. Musk may not relish the hostility, but he has shown no sign of backing down.",
        "Musk\u2019s purchase of Twitter, which he renamed X, marked a turning point in how he was perceived by his critics. The platform had previously been a comfortable space for the left.",
        "In the interview, Musk discussed his views on the economy, regulation, and the stakes of the election as he saw them, speaking to one of the largest audiences in podcasting.",
        "The conversation ran for hours and touched on technology, space, and the future of American manufacturing."
      ]
    },
    {
      id: "spanish-king-flood",
      cat: "News",
      kicker: "World",
      title: "Furious Crowd Hurls Mud and Insults at Spanish King During Visit to Flood-Ravaged Region",
      author: "Conservative Research Group",
      date: "November 3, 2024",
      readMins: 3,
      img: "PAIPORTA \u00b7 SPAIN",
      dek: "Angry survivors confronted the royal delegation as frustration over the disaster response boiled over.",
      body: [
        "On Sunday, a group of angry flood survivors in eastern Spain shouted insults and threw mud at King Felipe VI.",
        "\u201cGet out! Get out!\u201d the crowd yelled, along with other insults, as the King, Queen Letizia, and government officials tried to speak with residents of Paiporta, an area on the outskirts of Valencia.",
        "The confrontation underscored mounting anger over the pace of relief efforts following catastrophic flooding that killed scores of people.",
        "Authorities later defended the response and pledged additional resources for the hardest-hit communities."
      ]
    },
    {
      id: "hochul-anti-american",
      cat: "News",
      kicker: "Politics",
      title: "Guess Which Democrat Governor Says Voting for Trump-Supporting Republicans Makes You \u2018Anti-American\u2019?",
      author: "Conservative Research Group",
      date: "November 3, 2024",
      readMins: 3,
      img: "MSNBC SET \u00b7 NEW YORK",
      dek: "The remarks, delivered on a Sunday talk show, drew swift pushback from across the aisle.",
      body: [
        "New York Governor Kathy Hochul claimed that voting for Republicans who support former President Donald Trump makes a person both \u201canti-woman\u201d and \u201canti-American.\u201d",
        "Hochul made the comments while appearing on MSNBC on Sunday.",
        "The governor described how she sought to tie down-ballot Republicans to Trump, framing it as an advantage for Democratic candidates in the closing days of the campaign.",
        "Republicans condemned the remarks, arguing they dismissed the views of millions of voters."
      ]
    }
  ];

  const categories = ["Featured", "News", "Politics", "World", "Election", "Opinion"];

  return { articles, categories };
})();

// Brand config — overridden by a per-site inline script before this file loads.
window.CRG_BRAND = window.CRG_BRAND || {
  name: "Conservative Research Group",
  tagline: "Independent Reporting \u00b7 Est. 2020",
  mark: "CRG",
  markAccent: 1,
  footerAccentWord: 2,
};
