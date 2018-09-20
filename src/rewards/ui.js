
module.exports = {
    getnextbadge(currbadge) {
        var up_currbdge = currbadge.toUpperCase();
        switch (up_currbdge) {
            case "BRONZE":
                return "SILVER"
            case "SILVER":
                return "GOLD"
            case "GOLD":
                return "PLATINUM"
            case "PLATINUM":
                return "PLATINUM"
            default:
                return "BRONZE"
        }
    },
    getimagefortimeline : (badge, isnewlevel, reqline) => {
        var init_normal = require("../assets/ellipse_blue_small.png");
        var init_line = require("../assets/line_blue.png");

        var bonze_normal = require("../assets/ellipse_bronze_small.png");
        var bonze_newlevel = require("../assets/ellipse_bronze_big.png");
        var bonze_line = require("../assets/line_bronze_small.png");

        var silver_normal = require("../assets/ellipse_silver_small.png");
        var silver_newlevel = require("../assets/ellipse_silver_big.png");
        var silver_line = require("../assets/line_silver.png");

        var gold_normal = require("../assets/ellipse_gold_small.png");
        var gold_newlevel = require("../assets/ellipse_gold_big.png");
        var gold_line = require("../assets/line_gold.png");

        var platinum_normal = require("../assets/ellipse_platinum_small.png");
        var platinum_newlevel = require("../assets/ellipse_platinum_big.png");
        var platinum_line = require("../assets/line_platinum.png");

        switch (badge) {
            case "BRONZE":
                if (reqline)
                    return bonze_line;

                if (isnewlevel)
                    return bonze_newlevel;
                return bonze_normal;
            case "SILVER":
                if (reqline)
                    return silver_line;

                if (isnewlevel)
                    return silver_newlevel;
                return silver_normal;
            case "GOLD":
                if (reqline)
                    return gold_line;

                if (isnewlevel)
                    return gold_newlevel;
                return gold_normal;
            case "PLATINUM":
                if (reqline)
                    return platinum_line;

                if (isnewlevel)
                    return platinum_newlevel;
                return platinum_normal;
            default:
                if (reqline)
                    return init_line;
                return init_normal;
        }
    },
    getpointsto_nextbadge : (currbadge) => {
        var up_currbdge = currbadge.toUpperCase();
        switch (up_currbdge) {
            case "BRONZE":
                return "25"
            case "SILVER":
                return "50"
            case "GOLD":
                return "100"
            case "PLATINUM":
                return "0"
            default:
                return "10"
        }
    }
};