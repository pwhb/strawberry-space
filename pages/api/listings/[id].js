import clientPromise from "../../../lib/mongodb";
import { getSession } from "next-auth/react";
import { ObjectId } from "mongodb";

const ListingsHandler = async (req, res) => {
  const { method } = req;
  const client = await clientPromise;
  const db = client.db("test_database");

  switch (method) {
    case "GET":
      const { id } = req.query;
      const docs = await db
        .collection("listings")
        // .findOne({ _id: new ObjectId(id) })
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "added_by",
              foreignField: "_id",
              as: "added_by",
            },
          },
          { $unwind: "$added_by" },
        ])
        .toArray();

      res.json(docs[0]);
      break;
    case "POST":
      try {
        const session = await getSession({ req });
        const user = await db
          .collection("users")
          .findOne({ email: session.user?.email });

        const {
          title,
          description,
          price,
          currency,
          purpose,
          category,
          bedrooms,
          bathrooms,
          floor_level,
          floor_type,
          phones,
          images,
          lat,
          lng,
          home_no,
          street,
          township,
          state,
          tags,
          status,
          width,
          length,
          lot_width,
          lot_length,
        } = req.body;

        const doc = await db.collection("listings").insertOne({
          added_by: user._id,
          title,
          description,
          price: {
            value: price,
            currency,
          },
          purpose,
          category,
          bedrooms,
          bathrooms,
          floor_level,
          floor_type,
          phones,
          images,
          coords: {
            lat,
            lng,
          },
          address: {
            home_no,
            street,
            township,
            state,
          },
          tags,
          status,
          width,
          length,
          lot_width,
          lot_length,
          created_at: new Date(),
          updated_at: new Date(),
        });
        console.log(doc);
        res.status(200).json("ok");
      } catch (e) {
        console.log(e);
        res.json(e);
      }
  }
};

export default ListingsHandler;
