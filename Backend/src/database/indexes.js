import User from "../models/user.models.js";

const GOOGLE_ID_INDEX = "googleId_1";
const NAMESPACE_NOT_FOUND = 26;

/**
 * Databases created before the googleId index became partial still have it as
 * `{ unique: true, sparse: true }`. That index also covers the explicit `googleId: null`
 * stored for email/password accounts, so it only ever allowed one such account.
 * Mongoose will not replace an existing index whose options changed, so drop the
 * legacy index once and rebuild it from the schema. On up-to-date databases this
 * only lists the indexes and returns.
 */
export const repairLegacyGoogleIdIndex = async () => {
    try {
        // Let Mongoose's automatic index build finish first; on a legacy database it
        // fails on googleId_1, which is exactly what this function repairs.
        await User.init().catch(() => {});

        const indexes = await User.collection.indexes().catch((error) => {
            if (error.code === NAMESPACE_NOT_FOUND) {
                return [];
            }
            throw error;
        });

        const legacyIndex = indexes.find(
            (index) => index.name === GOOGLE_ID_INDEX && !index.partialFilterExpression
        );

        if (!legacyIndex) {
            return;
        }

        await User.collection.dropIndex(GOOGLE_ID_INDEX);
        await User.createIndexes();
        console.log(`Rebuilt users.${GOOGLE_ID_INDEX} as a partial unique index`);
    } catch (error) {
        console.error(
            `Could not repair users.${GOOGLE_ID_INDEX}. Drop it with db.users.dropIndex("${GOOGLE_ID_INDEX}") and restart the server.`,
            error
        );
    }
};
