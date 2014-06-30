function RiakDownIndexTotal(db_, rdic_opts) {
    rdic_opts = rdic_opts || {};

    function DB() {}
    DB.prototype = db_;

    db = new DB;
    db.parent = db_;

    db.root = function () {
        if (db.parent) {
            return db.root.call(db.parent);
        } else {
            return db;
        }
    };

    db.getIndexValueTotal = function (index, value, opts, callback) {
        var rdb = db.root();
        var request = {
            inputs:{
                bucket: opts.bucket,
                index: index,
                key: value
            },
            query: [{
                reduce: {
                    language: "erlang",
                    'module': "riak_kv_mapreduce",
                    'function': "reduce_count_inputs",
                    arg: {
                        reduce_phase_batch_size: 1000
                    }
                }
            }]
        };
        rdb.db.mapred({request: JSON.toString(request), content_type: 'application/json'}, function (err, reply) {
            console.log(err, reply);
            callback(err, reply);
        });
    };

    return db;
}

module.exports = RiakDownIndexTotal;
